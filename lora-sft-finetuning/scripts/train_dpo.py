#!/usr/bin/env python3
"""
DPO微调脚本 - Direct Preference Optimization
适用于CPU训练
"""

import os
import torch
from datasets import Dataset, load_from_disk
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig, PeftModel
from trl import DPOTrainer


def load_dpo_data(input_path):
    import json
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return Dataset.from_list(data)


def train_dpo():
    print("=" * 50)
    print("开始DPO强化学习微调")
    print("=" * 50)

    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    sft_model_path = "./models/sft_lora"
    output_dir = "./models/dpo_lora"

    print(f"\n使用基础模型: {model_name}")
    print(f"使用SFT模型: {sft_model_path}")
    print(f"输出目录: {output_dir}")

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token

    print("\n加载DPO数据集...")
    dataset = load_dpo_data("./data/train_dpo.json")

    print("\n加载SFT微调后的模型...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
    )

    if os.path.exists(sft_model_path):
        model = PeftModel.from_pretrained(model, sft_model_path)
        model = model.merge_and_unload()

    ref_model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
    )

    lora_config = LoraConfig(
        r=8,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )

    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=2,
        learning_rate=5e-6,
        num_train_epochs=3,
        weight_decay=0.01,
        logging_steps=10,
        save_strategy="epoch",
        save_total_limit=3,
        fp16=False,
        use_cpu=True,
        dataloader_num_workers=0,
        gradient_accumulation_steps=4,
    )

    dpo_trainer = DPOTrainer(
        model=model,
        ref_model=ref_model,
        args=training_args,
        beta=0.1,
        train_dataset=dataset,
        tokenizer=tokenizer,
        peft_config=lora_config,
    )

    print("\n开始DPO训练...")
    dpo_trainer.train()

    model.save_pretrained(output_dir)
    print(f"\nDPO模型已保存到: {output_dir}")


if __name__ == "__main__":
    train_dpo()

#!/usr/bin/env python3
"""
SFT微调脚本 - 使用LoRA方法
适用于CPU训练
"""

import os
import torch
from datasets import Dataset, load_from_disk
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model


def tokenize_function(examples, tokenizer, max_length=512):
    """
    文本tokenize函数
    """
    tokenized = tokenizer(
        examples["text"],
        truncation=True,
        max_length=max_length,
        padding="max_length",
    )
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized


def train():
    print("=" * 50)
    print("开始SFT微调训练")
    print("=" * 50)

    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    output_dir = "./models/sft_lora"
    data_path = "./data/processed_sft"

    print(f"\n使用模型: {model_name}")
    print(f"输出目录: {output_dir}")

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token

    print("\n加载数据集...")
    if os.path.exists(data_path):
        dataset = load_from_disk(data_path)
    else:
        import sys
        sys.path.insert(0, "./data")
        from prepare_data import prepare_dataset
        dataset = prepare_dataset("./data/train_sft.json")

    tokenized_dataset = dataset.map(
        lambda x: tokenize_function(x, tokenizer),
        batched=True,
        remove_columns=dataset.column_names,
    )

    print("\n加载模型...")
    model = AutoModelForCausalLM.from_pretrained(
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

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=2,
        learning_rate=2e-5,
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

    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
    )

    print("\n开始训练...")
    trainer.train()

    model.save_pretrained(output_dir)
    print(f"\n模型已保存到: {output_dir}")


if __name__ == "__main__":
    train()

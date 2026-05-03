#!/usr/bin/env python3
"""
推理脚本 - 测试微调后的模型
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel


def generate_response(prompt, model, tokenizer, max_new_tokens=100):
    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        temperature=0.7,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def format_prompt(instruction, input_text=""):
    if input_text:
        prompt = f"""Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input_text}

### Response:
"""
    else:
        prompt = f"""Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Response:
"""
    return prompt


def main():
    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    lora_path = "./models/sft_lora"

    print("=" * 50)
    print("加载模型...")

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token

    base_model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
    )

    try:
        model = PeftModel.from_pretrained(base_model, lora_path)
        print(f"已加载LoRA微调模型")
    except:
        print("未找到微调模型，使用基础模型")
        model = base_model

    model.eval()

    print("\n" + "=" * 50)
    print("模型推理测试")
    print("=" * 50)

    test_questions = [
        "请介绍一下自己",
        "什么是机器学习？",
        "如何学习编程？",
    ]

    for question in test_questions:
        print(f"\n问题: {question}")
        prompt = format_prompt(question)
        response = generate_response(prompt, model, tokenizer)
        answer = response.split("### Response:")[-1].strip()
        print(f"回答: {answer}")
        print("-" * 50)

    print("\n交互式模式 (输入 'quit' 退出):")
    while True:
        user_input = input("\n请输入问题: ")
        if user_input.lower() == "quit":
            break
        prompt = format_prompt(user_input)
        response = generate_response(prompt, model, tokenizer)
        answer = response.split("### Response:")[-1].strip()
        print(f"回答: {answer}")


if __name__ == "__main__":
    main()

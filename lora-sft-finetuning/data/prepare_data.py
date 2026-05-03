#!/usr/bin/env python3
"""
数据预处理脚本
将原始数据转换为训练所需的格式
"""

import json
from datasets import Dataset


def format_example(example):
    """
    格式化训练样本
    这里使用 Alpaca 风格的提示模板
    """
    instruction = example["instruction"]
    input_text = example["input"]
    output = example["output"]

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

    return {
        "prompt": prompt,
        "completion": output,
        "text": prompt + output
    }


def prepare_dataset(input_path, output_path=None):
    """
    准备训练数据集
    """
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    dataset = Dataset.from_list(data)
    dataset = dataset.map(format_example)

    print(f"数据集大小: {len(dataset)}")
    print("\n示例样本:")
    print(dataset[0]["text"])

    if output_path:
        dataset.save_to_disk(output_path)

    return dataset


if __name__ == "__main__":
    prepare_dataset("data/train_sft.json", "data/processed_sft")
    print("\n数据预处理完成！")

# 大模型微调学习教程

本项目旨在帮助初学者学习大模型的微调技术，包括：
- SFT (Supervised Fine-Tuning) 有监督微调
- RL (Reinforcement Learning) 强化学习微调（DPO/PPO）

## 环境要求

- Python 3.9+
- 无需GPU，使用CPU即可运行
- 使用轻量级模型进行学习

## 安装依赖

```bash
cd lora-sft-finetuning
pip install -r requirements.txt
```

## 学习步骤

### 第一步：SFT微调

SFT（有监督微调）是最基础的微调方法，使用标注数据让模型学习回答特定问题。

#### 1. 准备数据
```bash
cd data
python prepare_data.py
```

#### 2. 开始SFT训练
```bash
cd ..
python scripts/train_sft.py
```

这个脚本会：
- 加载轻量级的 TinyLlama-1.1B 模型
- 使用 LoRA（低秩适应）方法进行参数高效微调
- 训练3个epoch（在CPU上大概需要几分钟）

#### 3. 测试微调效果
```bash
python scripts/inference.py
```

### 第二步：DPO强化学习微调

在SFT之后，我们可以使用DPO（Direct Preference Optimization）进行强化学习微调，让模型更符合人类偏好。

#### 1. 准备DPO数据
`data/train_dpo.json` 包含了偏好对：chosen（好回答）vs rejected（差回答）

#### 2. 开始DPO训练
```bash
python scripts/train_dpo.py
```

## 核心概念解释

### 1. 什么是 LoRA？
LoRA（Low-Rank Adaptation）是一种参数高效的微调方法，它只训练模型中很小一部分参数（通常少于1%），而不是更新整个模型。这样可以：
- 大大减少显存占用
- 缩短训练时间
- 避免灾难性遗忘

### 2. 什么是 SFT？
SFT（Supervised Fine-Tuning）是有监督微调，使用输入-输出对来训练模型，让模型学会按照我们想要的方式回答问题。

### 3. 什么是 DPO？
DPO（Direct Preference Optimization）是一种强化学习方法，它通过比较好回答和差回答，让模型学习人类偏好。相比PPO，DPO更稳定、更易实现。

## 项目结构

```
lora-sft-finetuning/
├── data/              # 训练数据
│   ├── train_sft.json    # SFT训练数据
│   ├── train_dpo.json    # DPO训练数据
│   └── prepare_data.py   # 数据预处理
├── models/            # 保存微调后的模型
├── scripts/           # 训练和推理脚本
│   ├── train_sft.py      # SFT训练脚本
│   ├── train_dpo.py      # DPO训练脚本
│   └── inference.py      # 推理测试脚本
├── requirements.txt   # 依赖包
└── README.md
```

## 进阶学习建议

1. 尝试使用自己的数据集进行SFT
2. 调整LoRA的参数（r、lora_alpha等）
3. 尝试其他轻量级模型（如Phi-2、Qwen-0.5B等）
4. 学习PPO方法（TRL库提供了完整支持）

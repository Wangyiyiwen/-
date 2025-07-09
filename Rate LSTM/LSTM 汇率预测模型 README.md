# LSTM 汇率预测模型

1.第一个代码块已经良好封装，应该不用更改

2.第二部分为示例，做的是新币预测,用的是100天的数据，预测之后20天的数据

这个模型加载可以更改数据集和模型名字（csv的格式为 时间+汇率）

```python
sgp_model = CurrencyLSTMModel(currency_name='SGP', data_path='Exchange Rate SGP.csv', look_back=100)
sgp_model.train()
sgp_model.save('SGP_model.keras')
sgp_model.load('SGP_model.keras')
```


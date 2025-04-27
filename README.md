# Health Diagnoser

## Introduction

The body diagnoser is a web application that uses a specially-trained AI to diagnose health issues based on the user's description of pain and other symptoms.

## Features

Users can select points on their body and describe the pain in those sections in many ways. Here are the different descriptors:
- Body parts where they feel pain (click model)
- Pain type
- Duration of pain
- Pain severity
- Age
- Gender
- Additional symptoms, if any
- Extra details, if any
- Medication history, if wanted

## Installation / Run locally

Clone the git repository locally, and run `pip install -r backend/requirements.txt` and `npm install`. You will also need an `.env` file in the root directory. The .env file should contain the following:

```
OPENROUTER_API_KEY=[YOUR_API_KEY_HERE]
```

You will need an OpenRouter API key. You can get one for free at [https://openrouter.ai/]. We are using a specially trained Mistral AI 7B parameter model (free version).

## Credits

Made with 💖 by [Lakshya](https://github.com/lraj22) and [Bhuvan](https://github.com/Bhuvan-tech-creator).

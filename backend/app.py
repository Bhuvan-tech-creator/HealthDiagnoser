from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
CORS(app)

BODY_PART_MAPPING = {
    "left_elbow": "left elbow (lateral epicondyle)",
    "right_knee": "right knee (patellar region)",
    "left_shoulder": "left shoulder (glenohumeral joint)",
}

@app.route('/diagnose', methods=['POST'])
def diagnose():
    try:
        # Validate API key
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            logger.error("OPENROUTER_API_KEY is not set in .env")
            return jsonify({"error": "Server configuration error: API key missing"}), 500

        # Validate request data
        data = request.json
        if not data or 'location' not in data:
            logger.error("Invalid request data: %s", data)
            return jsonify({"error": "Invalid request: 'location' is required"}), 400

        body_part = BODY_PART_MAPPING.get(data['location'], data['location'])
        logger.debug("Processing diagnosis for body part: %s", body_part)

        prompt = f"""
        As a medical expert, analyze:
        - Exact location: {body_part}
        - Pain type: {data.get('painType', 'unspecified')}
        - Duration: {data.get('duration', 'unknown')}
        - Additional symptoms: {data.get('additional', 'none')}

        Provide a response in the following JSON format:
        {{
          "diagnosis": "The most likely condition is [condition].",
          "recommendations": "To address this condition, consider: [list actionable steps]."
        }}
        Ensure the recommendations are practical, safe, and suitable for a general audience.
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 300
        }

        logger.debug("Sending request to OpenRouter API")
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            logger.error("OpenRouter API failed: %s %s", response.status_code, response.text)
            return jsonify({"error": f"OpenRouter API failed: {response.status_code} {response.text}"}), 500

        result = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
        if not result:
            logger.error("Empty response from OpenRouter API")
            return jsonify({"error": "Empty response from API"}), 500

        logger.debug("API response: %s", result)
        try:
            import json
            parsed_result = json.loads(result)
            if not isinstance(parsed_result, dict) or 'diagnosis' not in parsed_result or 'recommendations' not in parsed_result:
                raise ValueError("Invalid JSON structure")
            return jsonify(parsed_result)
        except json.JSONDecodeError as e:
            logger.error("JSON parsing error: %s", e)
            return jsonify({
                "diagnosis": result.strip() or "Unable to parse diagnosis",
                "recommendations": "Consult a healthcare professional for personalized advice."
            }), 200
        except ValueError as e:
            logger.error("Invalid JSON structure: %s", e)
            return jsonify({
                "diagnosis": result.strip() or "Unable to parse diagnosis",
                "recommendations": "Consult a healthcare professional for personalized advice."
            }), 200

    except Exception as e:
        logger.error("Unexpected error: %s", str(e), exc_info=True)
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
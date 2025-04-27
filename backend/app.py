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
    "upper_arm": "upper arm (biceps/triceps region)",
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
        You are a medical expert tasked with providing a detailed and accurate diagnosis based on the following patient information:
        - Pain location: {body_part}
        - Pain type: {data.get('painType', 'unspecified')}
        - Duration: {data.get('duration', 'unknown')}
        - Additional symptoms: {data.get('additional', 'none')}
        - Extra details: {data.get('extraDetails', 'none')}

        Important instructions:
        - Consider ALL provided details (pain location, pain type, duration, additional symptoms, extra details) in utmost detail before making a diagnosis.
        - Ensure the diagnosis is anatomically accurate for the specified pain location. For example:
          - If the pain is in the upper arm (biceps/triceps region), suggest conditions like muscle strain, tendinitis, or overuse injury. Do NOT suggest shoulder-specific conditions like Shoulder Bursitis unless the pain location is explicitly the shoulder.
          - If the pain is in the left elbow, suggest conditions like lateral epicondylitis (tennis elbow) or medial epicondylitis (golfer's elbow).
        - Analyze every piece of information thoroughly to avoid random or inaccurate diagnoses.
        - Provide possible diagnoses in order from MOST LIKELY to LEAST LIKELY, clearly numbering each possibility (e.g., 1. Condition A, 2. Condition B).
        - For each diagnosis, provide actionable recommendations suitable for a general audience.

        Example:
        - Input: Dull pain in the upper arm for 2 days, no additional symptoms.
        - Expected Output: 
          - Diagnosis: "1. Muscle strain, 2. Biceps tendinitis"
          - Recommendations: "For Muscle strain: Rest the arm, apply ice for 15 minutes every few hours, and avoid heavy lifting. For Biceps tendinitis: Rest, apply heat, and consider gentle stretching after a few days."

        Return your response in the following JSON format:
        {{
          "diagnosis": "1. [Most likely condition], 2. [Second most likely condition], ...",
          "recommendations": "For [condition 1]: [steps]. For [condition 2]: [steps]. ..."
        }}
        Ensure the recommendations are practical, safe, and suitable for non-medical users.
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 500
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
            return jsonify({"error": f"OpenRouter API failed: ${response.status_code} ${response.text}"}), 500

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
        return jsonify({"error": f"Server error: ${str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
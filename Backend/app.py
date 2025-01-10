from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

app = Flask(__name__)
CORS(app)  # Allow requests from the frontend

# Shared data
questions = [
    {"question": "What is 5 + 5?", "answer": "10"},
    {"question": "Name the largest planet.", "answer": "jupiter"},
    {"question": "What is the capital of France?", "answer": "paris"},
]
current_question = 0
lock = threading.Lock()  # Prevent race conditions

@app.route("/get-question", methods=["GET"])
def get_question():
    global current_question
    if current_question >= len(questions):
        return jsonify({"finished": True})
    return jsonify({"question": questions[current_question]["question"]})

@app.route("/submit-answer", methods=["POST"])
def submit_answer():
    global current_question
    data = request.json
    player = data["player"]
    answer = data["answer"].strip().lower()

    with lock:
        if current_question < len(questions):
            correct_answer = questions[current_question]["answer"].lower()
            if answer == correct_answer:
                current_question += 1
                return jsonify({"correct": True, "player": player})
    return jsonify({"correct": False})

if __name__ == "__main__":
    app.run(debug=True)

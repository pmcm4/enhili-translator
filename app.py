import logging
import time
import math
import io
import base64  # Import the 'base64' module

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

import tensorflow as tf
import tensorflow_text as text
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from shutil import move



# Convert text dataset into tokens
model_name = 'ted_hrlr_translate_hv_en_converter'
tokenizers = tf.saved_model.load(model_name)

# Call saved model
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.util import ngrams

reloaded = tf.saved_model.load('en_to_hv_translator')

def plot_attention_head(sentence, translated_tokens, attention_weights):
    # The model didn't generate `<START>` in the output. Skip it.
    translated_tokens = translated_tokens[1:]

    in_tokens = tf.convert_to_tensor([sentence])
    in_tokens = tokenizers.en.tokenize(in_tokens).to_tensor()
    in_tokens = tokenizers.en.lookup(in_tokens)[0]

    head = 0
    # Shape: `(batch=1, num_heads, seq_len_q, seq_len_k)`.
    attention_heads = tf.squeeze(attention_weights, 0)
    attention = attention_heads[head]

    ax = plt.gca()
    ax.matshow(attention)
    ax.set_xticks(range(len(in_tokens)))
    ax.set_yticks(range(len(translated_tokens)))

    labels = [label.decode('utf-8') for label in in_tokens.numpy()]
    ax.set_xticklabels(labels, rotation=90)

    labels = [label.decode('utf-8') for label in translated_tokens.numpy()]
    ax.set_yticklabels(labels)

    # Save the plot as bytes in memory
    plot_image_bytes = io.BytesIO()
    plt.savefig(plot_image_bytes, format='png')
    plt.close()

    # Convert the bytes to base64 encoded string
    plot_image_base64 = base64.b64encode(plot_image_bytes.getvalue()).decode('utf-8')

    return plot_image_base64

app = Flask(__name__)
CORS(app, origins='*')

@app.route('/translate', methods=['POST'])
def translate():
    try:
        input_data = request.json
        sentence = input_data['sentence']
        translated_text, translated_tokens, attention_weights = reloaded(sentence)
        plot_image_base64 = plot_attention_head(sentence, translated_tokens, attention_weights)

        response = {
            'plot_image': plot_image_base64,
            'input_sentence': sentence,
            'prediction': translated_text.numpy().decode('utf-8'),
        }

        return jsonify(response)
    except Exception as e:
        error_response = {'error': str(e)}
        return jsonify(error_response), 500

if __name__ == '__main__':
    app.run()

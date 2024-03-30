from flask import Flask, request, jsonify, render_template
from youtube_transcript_api import YouTubeTranscriptApi as yta
from youtube_transcript_api._errors import TranscriptsDisabled
from langchain_openai import ChatOpenAI

import os
open_api_key=" " #Your key here
os.environ["OPENAI_API_KEY"]=open_api_key

## Basic Prompt Summarization
# from langchain_community.chat_models import ChatOpenAI
from langchain.schema import(
    AIMessage,
    HumanMessage,
    SystemMessage
)

all_texts = []
combined_string = """ """


llm=ChatOpenAI(model_name='gpt-3.5-turbo')

app = Flask(__name__)

def get_transcript_and_word_count(vidID: str):
    try:
        data = yta.get_transcript(vidID)
    except:
        print("Transcripts are disabled for this video.")
        return " "

    text = [segment['text'] for segment in data]

    return text

def gpt(abc):
    chat_messages=[
    SystemMessage(content='You are an expert assistant with expertize in creating full length SEO optimized articles from youtube transcripts.'),
    HumanMessage(content=f'Please provide an good full length article from the text provided. Make sure to add titles for paragraphs wherever necessary. I will use your response to my front end application. So add <h2> tags for titles and <p> tags for paragraphs.:\n TEXT: {abc}')
]
    llm.get_num_tokens(combined_string)
    return llm(chat_messages).content


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/your-backend-endpoint', methods=['POST'])
def receive_video_ids():
    global all_texts, combined_string
    if request.method == 'POST':
        data = request.json
        video_ids = data.get('videoIds')
        if video_ids:

            print("Received video IDs:", video_ids)
            for video_id in video_ids:
                transcript = get_transcript_and_word_count(video_id)
                all_texts.append(transcript)
                all_texts.append("\n")
            rawtext = [sentence for sublist in all_texts for sentence in sublist]
            combined_string = " ".join(rawtext)
            print("text received")
            generated_article = gpt(combined_string)

            return jsonify({"article": generated_article})
        else:
            return jsonify({'error': 'No video IDs received.'}), 400
    else:
        return jsonify({'error': 'Only POST requests are allowed.'}), 405

if __name__ == '__main__':
    app.run(debug=True)

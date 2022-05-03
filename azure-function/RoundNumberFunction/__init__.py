import logging, os
import json
import spacy
import numpy as np
import azure.functions as func
import requests


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    body = req.get_body().decode()
    json_data = json.loads(body)
    result = get_entity_mapping(json_data)
    return func.HttpResponse(result, charset = 'utf-8', headers = {"Content-Type": "text/html"})


def get_entity_mapping(json_data):
    en_nlp = spacy.load('en_core_web_sm')
    entity_maps = []
    for paragraph in json_data["paragraphs"]:
        doc = en_nlp(paragraph)
        entity_maps.append([(t.text_with_ws, t.ent_type_) for t in doc])
    return json.dumps(entity_maps)
from flask import Blueprint, request, g
from models.item import Item
from serializers.item import ItemSchema
from models.comment import Comment
from serializers.comment import CommentSchema
from models.comment import Comment
from decorators.logging import logging
from decorators.secure_route import secure_route
from decorators.time_taken import time_taken
from decorators.logging import logging


item_schema = ItemSchema()
comment_schema = CommentSchema()


from marshmallow.exceptions import ValidationError

router = Blueprint(__name__, "items")


@router.route("/items", methods=["GET"])
@time_taken
@logging
def get_all_the_items():
    items = Item.query.all()
   
    return item_schema.jsonify(items, many=True), 200


@router.route("/items/<int:item_id>", methods=["GET"])
@time_taken
def get_single_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return {" No items buddy"}, 404
    return item_schema.jsonify(item), 200


@router.route("/items", methods=["POST"])
@secure_route
def post_item():
    item_dict = request.json

    try:
        item = item_schema.load(item_dict)
    except ValidationError as e:

        return {"errors": e.messages, "messages": "Too bad, something went wrong"}

    item.save()

    return item_schema.jsonify(item), 200


@router.route("/items/<int:item_id>", methods=["PUT"])
@secure_route
def update_item(item_id):
    existing_item = Item.query.get(item_id)
    item_dict = request.json

    try:
        item = item_schema.load(item_dict, instance=existing_item, partial=True)

    except ValidationError as e:
        return {"errors": e.messages, "messages": "Too bad, something went wrong"}

    item.save()
    return item_schema.jsonify(item), 201


@router.route("/items/<int:item_id>", methods=["DELETE"])
@secure_route
def remove_item(item_id):
    item = Item.query.get(item_id)

    if item.user != g.current_user:
        return {"errors": "This is not your Item!"}, 402
    item.remove()
    return {"message": "Item deleted successfully"}, 200


@router.route("/ping", methods=["GET"])
def test():
    return " everything is up and running.", 200


@router.route("/items/<int:item_id>/comments", methods=["POST"])
@secure_route
def create_comment(item_id):
   
    comment_dict = request.json
    
    item = Item.query.get(item_id)
    
    comment = comment_schema.load(comment_dict)
    
    comment.item = item
    
    comment.save()
    
    return comment_schema.jsonify(comment)


@router.route("/items/<int:item_id>/comments/<int:comment_id>", methods=["DELETE"])
@secure_route
def delete_comment(item_id, comment_id):

    comment = Comment.query.get(comment_id)

    comment.remove()

    item = Item.query.get(item_id)

    return item_schema.jsonify(item), 202


@router.route("/items/<int:item_id>/comments/<int:comment_id>", methods=["PUT"])
@secure_route
def update_comment(item_id, comment_id):

    comment_dictionary = request.json
    existing_comment = Comment.query.get(comment_id)

    try:
        comment = comment_schema.load(
            comment_dictionary, instance=existing_comment, partial=True
        )

    except ValidationError as e:
        return {"errors": e.messages, "messages": "Something went wrong"}

    comment.save()

    item = Item.query.get(item_id)

    return item_schema.jsonify(item), 201

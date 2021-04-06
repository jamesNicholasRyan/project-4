### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly, Software Engineering Immersive
# BAGGLES

## Overview
This was my last project of the course. I was tasked with creating a full stack web application, where I must create a back-end using Python and Flask, and a font-end using JS and React. I decided to create a cashless bartering e-commerce site. I felt that the functionality of swapping items created an oportunity to create interesting endpoints in my server. 

Check it out [here](https://baggles.herokuapp.com/)!

We were given one week to complete this project

## Brief
* **Build a full-stack application** by making your own backend and your own front-end
* **Use a Python Flask API** using a Flask REST Framework to serve your data from a Postgres database
* **Consume your API with a separate front-end** built with React
* **Be a complete product** which most likely means multiple relationships and CRUD functionality for at least a couple of models
* **Implement thoughtful user stories/wireframes** that are significant enough to help you know which features are core MVP and which you can cut
* **Have a visually impressive design** to kick your portfolio up a notch and have something to wow future clients & employers. **ALLOW** time for this.
* **Be deployed online** so it's publicly accessible.

---

## Technologies used
- JavaScript (ES6)
- React.js
- Python
- Flask
- PostgreSQL
- Marshmallow
- Bulma
- axios
- HTML5
- CSS
- Git & GitHub


# Approach
## Server
For this project, it was clear from the start that I was going to utilise the **MVC** (Model, View, Controller) method of creation. The first objective was to identify all the models that were needed for the site. An obvious starting point is the **user** model. The site was to have users that register, login and log out. The idea of the bartering site was that these **users** were to swap and trade **items**. Therefore, it was important for us to create the **item** model too. Furthermore, I decided to implement **comments** and **review** models too, to allow these features of **users** and **items** retrospectively. 

### Relationships
The nature of the bartering system, where users can swap their own items for other user's items, introduced interesting relationships between the models in my back-end. I had to create a system where items could be **offered** to other items in the same table. To create this, I utilised an SQL database functioanltiy - **self-referential table**. 
```py
offers = db.relationship(
    'Item',
    backref='sale_item',
    secondary= item_offers_join,
    primaryjoin=id== item_offers_join.c.offer_item,
    secondaryjoin=id== item_offers_join.c.item_id)
```
Each item has an 'offers' collumn, which is **self-referencing** its own table - 'Item'. The relationship creates a new table called 'item_offers_join', where these relationships can be defined. This setup allows users to offer items they own for other users' items. 

Here is a view of the 'item_offers_join' table:
```py
item_offers_join = db.Table('item_offers_join',
    db.Column('item_id', db.Integer, db.ForeignKey('items.id'), primary_key=True),
    db.Column('offer_item', db.Integer, db.ForeignKey('items.id'), primary_key=True)
)
```

To display, access these relationships on the front-end, I created the relevant fields within the **item** serliazer. 'Offers' being other **items** that have been offered to this current item, and 'sale_item' being items that this current item has been offered to. It was important here to specify that the schema must not include 'offers' or 'sale_item' for the items in these columns, as this would lead to recursive infinite loop.
```py
offers = fields.Nested(lambda: ItemSchema(exclude=('offers', 'sale_item'), only=('id', 'name', 'owner.id', 'listed','image'), many=True))
sale_item = fields.Nested(lambda: ItemSchema(exclude=('offers', 'sale_item'), only=('id', 'name', 'owner.id'), many=True))
```

### Controllers
Once the models were created and the realtionships figured out, it was time to create the controllers. Apart from the common CRUD system of controllers, where we can Create, Read, Update and Delete each item or user, I also had to think about the specifics of the site I was creating. The swapping system required a specific back-end to make things run smoother on the front-end.

```py
@router.route("/swap/<int:item1_id>/<int:item2_id>", methods=["PUT"])
@secure_route
def swap_item(item1_id, item2_id):
    
    item1 = Item.query.get(item1_id)
    item2 = Item.query.get(item2_id)

    user1 = item1.owner
    user2 = item2.owner

    item2.owner = user1
    item1.owner = user2

    item1.listed = True
    item2.listed = True
        
    # change all items in offers list to available...
    offers = item1.offers
    for offer in offers:
        offer.listed = True

    # then clear the offers list
    item1.offers = []

    item1.save()
    user1.save()
    user2.save()

    items = Item.query.all()
    return item_schema.jsonify(items, many=True), 201
```
As well as a specific swap controller, I created a 'offer' controller, which handled the ability for users to offer their own items for other user's items:
```py
@router.route("/offers/<int:item1_id>/<int:item2_id>", methods=["PUT"])
def add_item_to_offer(item1_id, item2_id):
    item1 = Item.query.get(item1_id)
    item2 = Item.query.get(item2_id)
    
    item2.listed = False
    item1.listed = False
    
    item1.offers.append(item2)
    item2.save()
    item1.save()
    return item_schema.jsonify(item1), 200
```

---
## Front-end
Ultimately, this project grew with complexity as it progressed. By the time it came to implementing the font-end, there were lots of moving parts. There were three main pages: **user** page, single **item** page and the home page. Between these pages are the register, login adn the **items** list page. I used JavaScript and React.js for the front-end development of the site. 

Tackling the main functionality of the bartering system was a priority, as this was the site's USP.

Firstly, I implemented the ability to 'offer' items for other items. 
```js
async function Offer(offeredItemid) {
  try {
    console.log(offeredItemid)
    console.log(itemid)
    const { data } = await axios.put(`/api/offers/${itemid}/${offeredItemid}`, {},
      { headers: { Authorization: `Bearer ${token}` } })
    updateItem(data)
  } catch (err) {
    console.log(err)
  }
  location.reload()
}

<div>
  {available ? <button className='button is-primary' id={item.id} onClick={(e) => Offer(e.target.id)}>  {item.id} {item.name}  </button> :
    <button className='button is-warning'> {item.name} </button>
  }
</div>
```

Once the offering system was working, it was natural to move onto the swap functionality. Similar to the offering system, this wasn't too diffcult as I had done most of the hard work in the backend - It is a simple fetch to my API:
```js
async function Swap(offeredItemid) {
  try {
    console.log(offeredItemid)
    console.log(itemid)
    const { data } = await axios.put(`/api/swap/${itemid}/${offeredItemid}`, {},
      { headers: { Authorization: `Bearer ${token}` } })
    updateItem(data)
  } catch (err) {
    console.log(err)
  }
  location.reload()
}
```

## Challenges
- The most challenging aspect of the project was implementing the self-referencing relationships between the items and users. I had worked briefly on self-refernecing tables before, however, not to this scale. It took me a while to realise that the relationships would not 'show up' without referencing the relationships correctly in the serializers. In the end, I am happy with how it turned out despite how difficult it may have been. 
- 

## Screenshots
![](https://i.imgur.com/wCCKshk.png)
![](https://i.imgur.com/0prZts6.png)
![](https://i.imgur.com/pAhNFQJ.png)

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Slider from 'react-slick'
import { getLoggedInUserId } from '../lib/auth'
import sortedItems from './sortItems'
import Moment from 'react-moment'

export default function Carousel( { items, category, postings, userLocation } ) {

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1
  }

  function filterItems(category) {
    return sortedItems(postings, userLocation, items).filter((item) => {
      return item.category === category
    })
  }

  function cleanCat() {
    const clean = category.replace(/_/g, ' ')
    const catSplit = clean.split('')
    const capCat = (catSplit[0].toUpperCase()).concat(catSplit.splice(1,catSplit.length))
    return capCat.replace(/,/g, '')
  }

  function mapItems(itemArray) {
    const limitedItems = itemArray.slice(0,8)
    return limitedItems.map((item, i) => {
      return <div className="card carousel-card" key={i}>
        <div className="container">
          <div className="card-image">
            <figure className="image is-4by3">
              <img src={item.image} alt="Placeholder image"/>
            </figure>
          </div>
          
          <div className="card-content">
            <div className="content pb-4">
              <p className="title is-4">{item.name}</p>
              <p className="subtitle">{item.owner.town}</p>
              <p className="small-text">Created <Moment fromNow ago>{item.created_at}</Moment> ago by {item.owner.username}.</p>
            </div>
          </div>

          <footer className="card-footer">
            <div className="carousel-footer container">
              <Link to={`/items/${item.id}`}>
                <div className="color-link-button button"><span className="baggle">Baggle!</span></div>
              </Link>
            </div>
          </footer>
          
        </div>
      </div>
    })
  }

  return <div className="has-text-left">
    <p className="carousel-header">{cleanCat()}</p>
    <Slider {...settings}>
      {mapItems(filterItems(category))}
    </Slider>
  </div>
}
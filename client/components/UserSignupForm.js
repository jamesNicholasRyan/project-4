import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { debounce } from 'lodash'

const debouncedSave = debounce((searchQuery, updateSearchResults) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?country=gb&access_token=pk.eyJ1IjoidXJ1MzgiLCJhIjoiY2ttNnBveXQ2MHFnaDJ4anhtdmhnbHBmeSJ9.OWgGgvZU2cJlbxp-jAJh_g`)
    .then(({ data }) => {
      const search = data.features.map(location => {
        return {
          id: location.id,
          placeName: location.place_name,
          location: {
            lat: location.center[1],
            long: location.center[0]
          }
        }
      })
      updateSearchResults(search)
    })
}, 500)

export default function UserSignupForm({ formData, handleSubmit, handleChange, updateFormData, errors, registrationSuccess }) {

  // const [creationSuccess, updateCreationSuccess] = useState(false)
  // const [uploadSuccess, updateUploadSuccess] = useState(false)
  const [searchQuery, updateSearchQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])

  useEffect(() => {
    debouncedSave(searchQuery, updateSearchResults)
  }, [searchQuery])

  function createSearchQuery(event) {
    updateSearchQuery(event.target.value)
    updateFormData({ ...formData, search: event.target.value })
  }

  function handlePlaceSelect({ placeName, location }) {
    updateFormData({ ...formData, location: placeName, lat: location.lat, lng: location.long, search: placeName })
    updateSearchQuery('')
    updateSearchResults([])
  }

  return <div className="section">
    <div className="container">

      <form className="form" onSubmit={handleSubmit}>

        <div className="field">
          <label className="label">Username</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.username}
              onChange={handleChange}
              name={'username'} 
            />
            {errors.username && <small className="has-text-danger">{errors.username.message}</small>}
          </div>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.email}
              onChange={handleChange}
              name={'email'} />
            {errors.email && <small className="has-text-danger">{errors.email.message}</small>}
          </div>
        </div>

        <div className='field'>
          <label className='label'>Locaiton</label>
          <div className='control'>
            <input
              className='input'
              placeholder='Search...'
              type='text'
              value={formData.search || ''}
              onChange={createSearchQuery}
              name={'search'}
            />
            {errors.location && <small className="has-text-danger">{errors.location.message}</small>}
          </div>
          {searchResults.length > 0 &&
            <div className='dropdown is-active is-fullwidth'>
              <div className='dropdown-menu'>
                <div className='dropdown-content'>
                  {searchResults.map((place) => {
                    return <div key={place.id}>
                      <div className='dropdown-item' id='cardHover' onClick={() => handlePlaceSelect(place)}>{place.placeName}</div>
                      <hr className="dropdown-divider"></hr></div>
                  })}
                </div>
              </div>
            </div>}
          {/* {errors.time && <small className='has-text-danger'>{errors.time.message}</small>} */}
        </div>

        <div className="field">
          <label className="label">About</label>
          <div className="control">
            <textarea
              className="textarea"
              type="text"
              value={formData.bio}
              onChange={handleChange}
              name={'bio'} />
            {errors.bio && <small className="has-text-danger">{errors.bio.message}</small>}
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className="input"
              type="password"
              value={formData.password}
              onChange={handleChange}
              name={'password'} />
            {errors.password && <small className="has-text-danger">{errors.password.message}</small>}
          </div>
        </div>
        <button className="button">Submit</button>
      </form>
    </div>
  </div>
}
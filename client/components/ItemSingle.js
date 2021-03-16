import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { isCreator } from '../lib/auth'
import { Link } from 'react-router-dom'
import '../styles/style.scss'
import Icon from '@material-ui/core/Icon'
import ItemUpdateForm from './ItemUpdateForm'



export default function ItemSingle({ match, history }) {

  const itemid = match.params.itemid
  const [title, setTitle] = useState('')
  const [item, updateItem] = useState({})
  const [offeredList, updateOfferedList] = useState([])
  const [currentUser, updateCurrentUser] = useState([])
  const [loading, updateLoading] = useState(true)
  const [wishlisted, updateWishlisted] = useState(0)
  const [userData, updateUserData] = useState([])
  const [modalState, setModalState] = useState(false)
  const [currentUserInventory, updateCurrentUserInventory] = useState([])
  const [editState, updateEditState] = useState(false)
  const [singleItem, getSingleItem] = useState({})

  const token = localStorage.getItem('token')
  const [commentData, updateCommentData] = useState('')

  useEffect(() => {
    async function fetchItem() {
      try {
        const { data } = await axios.get(`/api/items/${itemid}`)
        updateItem(data)
        updateOfferedList(data.offers)
      } catch (err) {
        console.log(err)
      }
    }
    fetchItem()
  }, [])

  const [formData, updateFormData] = useState({
    name: '',
    typeof: '',
    category: '',
    description: '',
    image: '',
    listed: 'true'
  })

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get(`/api/items/${itemid}`)
      getSingleItem(data)
      const mappedData = { ...data }
      updateFormData(mappedData)
    }
    fetchData()
  }, [])


  async function fetch(offeredItemid) {
    try {
      console.log(offeredItemid)
      console.log(itemid)
      const { data } = await axios.put(`/api/offers/${itemid}/${offeredItemid}`, {},
        { headers: { Authorization: `Bearer ${token}` } })
      updateItem(data)
    } catch (err) {
      console.log(err)
    }
    // history.push('/items')
    location.reload()
  }




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
    // history.push('/items')
    location.reload()
  }





  async function handleDelete() {
    await axios.delete(`/api/items/${itemid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    location.reload()
  }
  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get('/api/users')
      updateUserData(data)
      updateLoading(false)
    }
    fetchData()
  }, [])
  // console.log(userData)

  const toggleModal = () => {
    setModalState(!modalState)
  }

  // function updateOffer(e) {
  //   updateOfferedItemid(e.target.id)
  //   fetch()
  // }
  function handleChange(event) {
    updateCommentData(event.target.value)
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    updateFormData({ ...formData, [name]: value })
  }

  async function handleComment(e) {
    e.preventDefault()
    const newCommentData = { content: commentData }
    try {
      const { data } = await axios.post(`/api/items/${itemid}/comments`, newCommentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }

    setTitle('')
    // updateItem(data)
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    const newFormData = {
      ...formData
    }
    try {
      await axios.put(`/api/items/${itemid}`, newFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('editing item')
      updateEditState(false)
      location.reload()
    } catch (err) {
      console.log('ERROR!')
      console.log(err)
    }
  }



  async function fetchCurrentUserInventory() {
    const token = localStorage.getItem('token')
    try {
      const { data } = await axios.get('/api/current_user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateCurrentUserInventory(data.inventory)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  useEffect(() => {
    fetchCurrentUserInventory()
  }, [])


  async function handleDeleteComment(commentId) {
    try {
      await axios.delete(`/api/items/${itemid}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
  }

  // ! CATHY

  async function fetchCurrentUser() {
    const token = localStorage.getItem('token')
    try {
      const { data } = await axios.get('/api/current_user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateCurrentUser(data)
    } catch (err) {
      console.log(err.response.data)
    }
  }


  // console.log(item.wishlisted)

  useEffect(() => {
    fetchCurrentUser()
    updateLoading(false)
  }, [])

  async function handleAddToWishlist() {
    const newWishlistedTotal = item.wishlisted + 1
    updateWishlisted(newWishlistedTotal)
    console.log(newWishlistedTotal)
    try {
      await axios.put(`/api/items/${itemid}`, { wishlisted: `${newWishlistedTotal}` }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.log(err.response.data)
    }
    try {
      await axios.post(`/api/users/${currentUser['id']}/items/${itemid}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        })
      console.log("added to wishlist")
    } catch (err) {
      console.log(err.response.data)
    }

  }

  if (loading) {
    return <div>Page is Loading</div>
  }

  // ! END

  if (!item.owner) {
    return null
  }
  // console.log(currentUserInventory)
  // console.log(currentUser['inventory.id'])


  // if (item) {
  //   console.log('ownerid:')
  //   // console.log(item.owner['id'])
  //   // const owner = item.owner
  //   console.log(item.owner['id'])
  // }

  return <div className="columns">
    {<div className="Mod">
      <div className={`modalBackground modalShowing-${modalState}`}>
        <div className="innerModal">
          <div className="modalImage">
            <img src="https://images.unsplash.com/photo-1615558254521-201fe44dbf8e?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1OXx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt={item.name}
            />
          </div>
          <div className="modalText">
            <h2> Would you like to make an offer?</h2>

            <form action="">
              {!isCreator(item.owner['id']) && currentUserInventory.map((item, index) => {
                const available = item.listed
                return <div key={index}>
                  <div>
                    {available ? <button className='button is-primary' id={item.id} onClick={(e) => fetch(e.target.id)}>  {item.id} {item.name}  </button> :
                      <button className='button is-warning'> {item.name} </button>
                    }
                  </div>
                </div>

              })}
            </form>
            <button className="exit" onClick={() => toggleModal()}>
              Exit
            </button>

          </div>
        </div>

      </div>
      <button onClick={() => toggleModal()}>Baggle</button>
    </div>
    }
    <div className="column">
      <figure className='image'>
        <img src={item.image} alt={item.name} />
      </figure>
    </div>

    <div className="column">
      <article className="tile box is-vertical">
        <div className="contents">
          <div className="grid-header">
            <h2 className="title">About</h2>
            {isCreator(item.owner['id']) && <button className="button is-danger" onClick={handleDelete} >☠️ Delete Item</button>}
            {isCreator(item.owner.id) && <button className="button is-info" onClick={() => updateEditState(true)}>Edit Item <Icon>create</Icon></button>}
          </div>

          {editState === false ?
            <div className="contents">
              <div className="container mb-4">
                <label>Name</label>
                <p>{item.name}</p>
              </div>
              <div className="container mb-4">
                <label>Type</label>
                <p>{item.typeof}</p>
              </div>
              <div className="container mb-4">
                <label>Category</label>
                <p>{item.category}</p>
              </div>
              <div className="container mb-4">
                <label>Description</label>
                <p>{item.description}</p>
              </div>
            </div> :
            <div>
              <ItemUpdateForm
                handleEditSubmit={handleEditSubmit}
                handleEditChange={handleEditChange}
                formData={formData}
              />
              {/* <ImageUpload
                formData={formData}
                updateFormData={updateFormData}
              /> */}
            </div>}
        </div>
      </article>

      {/* <h1 className="title">{item.name}</h1>
      <h2 className="subtitle">{`Type of : ${item.typeof}`}</h2>
      <h2 className="subtitle">{`Category: ${item.category}`}</h2>
      <h2 className="subtitle">{`Description: ${item.description}`}</h2>
      {/* <h2 className="subtitle">{`Image: ${item.owner.image}`}</h2> */}
      {/* <h2 className="subtitle">{`Availability: ${item.listed}`}</h2> */}

      {offeredList.map((offeredItem, index) => {
        return <div key={offeredItem.id} >
          <div>
            <div id={offeredItem.id} >{offeredItem.name}</div>
          </div>
          <div>
            {isCreator(item.owner['id']) && <button id={offeredItem.id} className='is-warning' onClick={(e) => Swap(e.target.id)}>SWAP!</button>}
          </div>
        </div>

      })}
      <button className="button" onClick={handleAddToWishlist}>Add to wishlist</button>

      {item.comments && item.comments.map(comment => {
        return <article key={comment._id} className="media">
          <div className="media-content">
            <div className="content">
              <p className="subtitle">
                {comment.user.username}:
              </p>
              <p>{comment.content}</p>
            </div>
          </div>
          {isCreator(comment.user.id) && <div className="media-right">
            <button
              className="delete"
              onClick={() => handleDeleteComment(comment.id)}>
            </button>
          </div>}
        </article>
      })}

      {/* {
        <figure className="image is-128x128">
          <img className="is-rounded" src={currentUser.profile_image} />
        </figure>
      } */}

      <article className="media">
        <div className="media-content">
          <div className="field">
            <p className="control">
              <textarea
                className="textarea"
                placeholder="Make a comment.."
                onChange={handleChange}
                value={commentData.content}
              >
              </textarea>
            </p>
          </div>
          <div className="field">
            <p className="control">
              <button
                onClick={handleComment}
                className="button is-info"
              >
                Submit
              </button>
            </p>

          </div>

        </div>



      </article>
    </div>
  </div >

}






{/* <div className="Mod">
  <div className={`modalBackground modalShowing-${modalState}`}>
    <div className="innerModal">
      <div className="modalImage">
        <img src="https://images.unsplash.com/photo-1615558254521-201fe44dbf8e?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1OXx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt={item.name}
        />
      </div>
      <div className="modalText">
        <h2> Would you like to make an offer?</h2>

        <form action="">
          {!isCreator(item.owner['id']) && currentUserInventory.map((item, index) => {
            return <div key={index}>
              <div>
                <button>   {item.name}  </button>
              </div>
            </div>

          })}
        </form>
        <button className="exit" onClick={() => toggleModal()}>
          Exit
    </button>

      </div>
    </div>

  </div>
  <button onClick={() => toggleModal()}>Baggle</button>
</div> */}



// {!isCreator(item.owner['id']) && currentUserInventory.map((item, index) => {
//   const available = item.listed
//   return <div key={item.id} >
//     <div>
//       {available ? <button className='button is-primary' id={item.id} onClick={(e) => fetch(e.target.id)}>  {item.id} {item.name}  </button> :
//         <button className='button is-warning'> {item.name} </button>
//       }
//     </div>
//   </div>

// })}
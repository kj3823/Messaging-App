import React, {
  Component,
  Fragment
} from 'react';

import OpenSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';

import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    fetch('http://localhost:8080/feed/status', {
        headers: {
          Authorization: 'Bearer ' + this.props.token //setting the Authorization header for our JWT Token, this props used in react
        }
      })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          status: resData.status
        });
      })
      .catch(this.catchError);

    this.loadPosts();

    OpenSocket('http://localhost:8080');
  }

  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };


  loadPosts = direction => {
    if (direction) {
      this.setState({
        postsLoading: true,
        posts: []
      });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({
        postPage: page
      });
    }
    if (direction === 'previous') {
      page--;
      this.setState({
        postPage: page
      });
    }
    fetch('http://localhost:8080/feed/posts?page=' + page, { //query parameter for pagination
        headers: {
          Authorization: 'Bearer ' + this.props.token //setting the Authorization header for our JWT Token, this props used in react
        }
      })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          posts: resData.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageURL //adding an imagePath key for use in the frontend, this allows us to store the image path incase no new image is choosen.
            }
          }),
          totalPosts: resData.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    console.log(event)
    fetch('http://localhost:8080/feed/updateStatus', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'Content-Type': 'Application/json '
        },
        body: JSON.stringify({
          statusUpdate: this.state.status
        })
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({
      isEditing: true
    });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = {
        ...prevState.posts.find(p => p._id === postId)
      };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({
      isEditing: false,
      editPost: null
    });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // Set up data (with image!)
    const formData = new FormData();
    //The forData method allows us to set key-value pairs which can be sent to the backend using the fetch of send method.
    formData.append('title', postData.title);
    formData.append('content', postData.title);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/feed/post';
    let method = "POST";
    if (this.state.editPost) {
      url = 'http://localhost:8080/feed/post/' + this.state.editPost._id; //if editing a post, to fetch the post.
      method = 'PUT'
    }

    fetch(url, {
        method: method,
        body: formData,
        // body: JSON.stringify({
        //   title: postData.title,
        //   content: postData.content
        // }),
        // headers: {
        //   'Content-Type': 'Application/json '
        // }
        headers: {
          Authorization: 'Bearer ' + this.props.token //setting the Authorization header for our JWT Token, this props used in react
        }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating or editing a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        const post = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt
        };
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else if (prevState.posts.length < 2) {
            updatedPosts = prevState.posts.concat(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({
      status: value
    });
  };

  deletePostHandler = postId => {
    this.setState({
      postsLoading: true
    });
    fetch('http://localhost:8080/feed/post/' + postId, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + this.props.token //setting the Authorization header for our JWT Token, this props used in react
        }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState(prevState => {
          const updatedPosts = prevState.posts.filter(p => p._id !== postId);
          return {
            posts: updatedPosts,
            postsLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          postsLoading: false
        });
      });
  };

  errorHandler = () => {
    this.setState({
      error: null
    });
  };

  catchError = error => {
    this.setState({
      error: error
    });
  };

  render() {
    return ( <
      Fragment >
      <
      ErrorHandler error = {
        this.state.error
      }
      onHandle = {
        this.errorHandler
      }
      /> <
      FeedEdit editing = {
        this.state.isEditing
      }
      selectedPost = {
        this.state.editPost
      }
      loading = {
        this.state.editLoading
      }
      onCancelEdit = {
        this.cancelEditHandler
      }
      onFinishEdit = {
        this.finishEditHandler
      }
      /> <
      section className = "feed__status" >
      <
      form onSubmit = {
        this.statusUpdateHandler
      } >
      <
      Input type = "text"
      placeholder = "Your status"
      control = "input"
      onChange = {
        this.statusInputChangeHandler
      }
      value = {
        this.state.status
      }
      /> <
      Button mode = "flat"
      type = "submit" >
      Update <
      /Button> < /
      form > <
      /section> <
      section className = "feed__control" >
      <
      Button mode = "raised"
      design = "accent"
      onClick = {
        this.newPostHandler
      } >
      New Post <
      /Button> < /
      section > <
      section className = "feed" > {
        this.state.postsLoading && ( <
          div style = {
            {
              textAlign: 'center',
              marginTop: '2rem'
            }
          } >
          <
          Loader / >
          <
          /div>
        )
      } {
        this.state.posts.length <= 0 && !this.state.postsLoading ? ( <
          p style = {
            {
              textAlign: 'center'
            }
          } > No posts found. < /p>
        ) : null
      } {
        !this.state.postsLoading && ( <
          Paginator onPrevious = {
            this.loadPosts.bind(this, 'previous')
          }
          onNext = {
            this.loadPosts.bind(this, 'next')
          }
          lastPage = {
            Math.ceil(this.state.totalPosts / 2)
          }
          currentPage = {
            this.state.postPage
          } > {
            this.state.posts.map(post => ( <
              Post key = {
                post._id
              }
              id = {
                post._id
              }
              author = {
                post.creator.name
              }
              date = {
                new Date(post.createdAt).toLocaleDateString('en-US')
              }
              title = {
                post.title
              }
              image = {
                post.imageUrl
              }
              content = {
                post.content
              }
              onStartEdit = {
                this.startEditPostHandler.bind(this, post._id)
              }
              onDelete = {
                this.deletePostHandler.bind(this, post._id)
              }
              />
            ))
          } <
          /Paginator>
        )
      } <
      /section> < /
      Fragment >
    );
  }
}

export default Feed;
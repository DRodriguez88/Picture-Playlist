import React, { Component } from 'react';
import Clarifai from 'clarifai';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    
    // inside of our state object, we set our API keys in order to get data from the APIs
    this.state = {
      clarifaiKey: 'b152ab226db545d7ae11f33a8756cda5',
      mashapeKey: '8T7epZZomNmshvkB0xHh8YgIgUhnp1mbZ8RjsnqijKFCpgCBCc',
      imgURL: 'http://miriadna.com/desctopwalls/images/max/Wet-sand.jpg',
      imageWords: [],
      songs: []

    }
    this.changeHandler = this.changeHandler.bind(this)
  }

  componentDidMount() {

    /* Use Clarifai to grab image details */
    this.getImageDetails().then((imageDetails) => {

      /* Find top 5 terms inside image details */
      var words = [];
      for(let i=0; i<5; i++){
        words.push(imageDetails.outputs[0].data.concepts[i].name);
      }
      this.setState({
        imageWords: words
      },()=>this.getMusicTerms())

      /* After, querying for words associated with an image, query those top 5 terms for songs */
      
    });
  }

  getImageDetails() {

      //images we are going to send to the api to get terms for
      var images = this.state.imgURL;

      //instantiate a new Clarifai app passing in your api key.
      const app = new Clarifai.App({ apiKey: this.state.clarifaiKey});

      // predict the contents of an image by passing in a url
      return new Promise((res,rej) => {
        app.models.predict(Clarifai.GENERAL_MODEL, images)
        .then((response) => {
            res(response);
        })
        .catch(err => rej(err));
      });
  }

  getMusicTerms() {
    //using the image terms, make a query
    var songArray = [];
    this.state.imageWords.map((imageWord, index) =>
      axios({
        method: 'get',
        url: 'https://musixmatchcom-musixmatch.p.mashape.com/wsr/1.1/track.search?f_has_lyrics=1&page=1&page_size=5&q_track='+ imageWord +'&s_track_rating=desc',
        headers: {
          'X-Mashape-Key' : `${this.state.mashapeKey}`,
          'accept' : 'application/json'
        }
      }).then((res) => {
        res.data.map((song, index) => 
        songArray.push(res.data[index].track_name + ' by ' + res.data[index].artist_name));
      }).catch(err => console.log(err)));
      this.setState({
        songs: songArray
      })
  }

  changeHandler(e){
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    return (
      <div className="App">
        <input name='imgURL' placeholder='IMAGE URL' onChange={this.changeHandler}></input>
        <img alt=''src={this.state.imgURL}/>
        <button onClick={()=>console.log(this.state.songs)}/>
      </div>
    );
  }
}
export default App;

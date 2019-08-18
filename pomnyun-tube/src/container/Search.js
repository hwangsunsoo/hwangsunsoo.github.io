import React, { Component } from 'react';
import axios from 'axios';
import FullContent from '../component/fullcontent/FullContent.js';
import ContentList from '../component/contentList/ContentList';

export default class Search extends Component {

    state = {
        fullContent: {"id":"lZjDE0auEMY","channel":"","name":""},
        contents: [],
		keyword: '',
		error: ''
    };

    handleInputChange = e => {
        this.setState({ keyword: e.target.value });
    }

    handleSubmit = e => {
        this.fatchSearch(this.state.keyword);
        e.preventDefault();
    }

    handleFullContentChange = (content) => {
        this.setState({
            fullContent:content
        })
    }

    setContents = (data) => {
		let list = [];
        data.items.forEach((item, index) => {
			if(item.id.videoId) {
				if(
					item.snippet.channelTitle === '법륜스님의 즉문즉설' ||
                    item.snippet.channelTitle === '법륜스님의 희망세상만들기' ||
                    item.snippet.channelTitle === '법륜스님과 함께하는행복학교'
				) {
                    list.push({id:item.id.videoId,channel:item.snippet.channelTitle,name:item.snippet.title})
                    console.log( JSON.stringify(list) );
				}
            }
        })
        return list
    }
    
    async fatchSearch(keyword) {
        const maxResults = 50;
        const token = 'AIzaSyCpm9cB4ckQMeNVzNieK-1Fc6A4FQW2u0M';
		
		// 예외처리 
        try {
            const { data } = await axios.get(`https://www.googleapis.com/youtube/v3/search?q=법륜+${keyword}&part=snippet&key=${token}&maxResults=${maxResults}`);
            console.log( JSON.stringify(data) );
            this.setState({ contents: this.setContents(data) });
        } catch (e) {
            console.log(e)
            this.setState({ error: "구글 유튜브 API 서버와 통신에 실패하였습니다. 일간 제공한도를 초과한 것으로 추정됩니다." })
        }
    }

    render() {
        return (
            <div className="search-page">
                <p className="search-info">지금 무엇 때문에 괴롭나요?</p>
                <div className="search-area">
                    <form onSubmit={this.handleSubmit}>
                        <input
                            className="search-input"
                            type="search"
                            value={this.state.keyword}
                            onChange={this.handleInputChange}
                        />
                        <a className="search-button" onClick={this.handleSubmit}>SEARCH</a>
                    </form>
                </div>
                <FullContent content={this.state.fullContent}/>
                <ContentList contents={this.state.contents} onClick={this.handleFullContentChange} />
                <p>{this.state.error}</p>
            </div>
        )
    }

}

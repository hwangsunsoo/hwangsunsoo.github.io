import React, { Component } from 'react';
import './ContentList.css';
import Content from "../content/Content.js"
import PropTypes from "prop-types";

//콘텐츠의 리스트를 보여주는 컴포넌트
class ContentList extends Component {

	listRender() {
		console.log(this.props.contents)
		let component = []
		component.push(
			<ul className="content-list">
				{
					this.props.contents.map((item,index) => {
						return (
							<li className="content-item" key={index}>
								<Content content={item} onClick={this.props.onClick}/>
							</li>
						)
					})
				}
			</ul>
		)
		return component
	}

	render() {
		return (
			<div className="content-area">
				{this.listRender()}
			</div>
		)
	}
}

ContentList.propTypes = {
	contents: PropTypes.array,
	onClick: PropTypes.func
}

export default ContentList;

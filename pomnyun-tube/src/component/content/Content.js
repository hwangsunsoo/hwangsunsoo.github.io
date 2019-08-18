import React, { Component } from 'react';
import "./Content.css";
import PropTypes from "prop-types";

const FullContentLink = (props) => {
	return (
		<a onClick={props.onChangeFullContent}>
			{props.children}
		</a>
	)
}

class Content extends Component {

	onChangeFullContent = () => {
		this.props.onClick(this.props.content)
		window.scrollTo(0, 0);
	}

	displayImg = () => {
		let imgSrc = "https://img.youtube.com/vi/"+this.props.content.id+"/0.jpg"
		let imgComponent = (
			<div>
				<span className="thumbnail-area">
					<img className="thumbnail" src={imgSrc} />
				</span>
				<strong className="video-title">{this.props.content.name}</strong>
				<em className="channel-title">{this.props.content.channel}</em>
			</div>
		);
		return imgComponent
	}

	render() {
		return (
			<div className="content">
				<FullContentLink onChangeFullContent={this.onChangeFullContent}>{this.displayImg()}</FullContentLink>
			</div>
		);
	}
}

Content.propTypes = {
	onClick : PropTypes.func,
	content: PropTypes.object
}

export default Content;

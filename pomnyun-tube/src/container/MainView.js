import React, { Component } from 'react';

class MainView extends Component {
	render() {
		return (
			<div className="mainView">
				<div className="article-area">
					<p className="article-text">본 사이트는 <a href="http://m.jungto.org/" target="_blank">[정토회]</a>에서 운영하는 곳이 아닙니다.</p>
					<p className="article-text">단순히 유튜브 API 서버와 통신하여 키워드와 관련된 컨텐츠를 호출하여 제공하는 역할만을 하고 있습니다.</p>
					<p className="article-text">컨텐츠의 내용과 본 사이트는 무관하며 유튜브 컨텐츠의 저작권은 <a href="http://m.jungto.org/" target="_blank">[정토회]</a>에 있습니다.</p>
					<p className="article-text">컨텐츠의 신뢰성을 높이기 위하여 특정 채널(즉문즉설, 희망세상만들기, 행복학교 등)로 필터링하고 있습니다.</p>
					<p className="article-text">코드는 <a href="https://github.com/hwangsunsoo/hwangsunsoo.github.io/blob/master/pomnyun-tube/src/container/Search.js" target="_blank">[여기]</a>에서 확인하실 수 있습니다.</p>
					<p className="article-text">참고: <a href="https://www.youtube.com/user/jungtosociety" target="_blank">법륜스님의 즉문즉설</a> / <a href="https://www.youtube.com/user/jtinfo5" target="_blank">법륜스님의 희망세상만들기</a></p>
				</div>
			</div>
		);
	}
}

export default MainView;

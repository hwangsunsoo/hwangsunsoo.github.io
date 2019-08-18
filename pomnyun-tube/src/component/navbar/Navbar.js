import React, { Component } from 'react';
import { Link } from 'react-router-dom';//화면 이동을 위해 Link를 react-router-dom에서 불러옴
import './Navbar.css';

//상단 메뉴를 가지고 있는 컴포넌트
class Navbar extends Component {

	state = {
		navIsActive: ''
	};

	navbarButtonClick = e => {
		if(this.state.navIsActive) {
			this.setState({navIsActive:false})
		} else {
			this.setState({navIsActive:true})
		}
		// console.log(this.state.navIsActive)
        e.preventDefault();
	}
	
	render() {
		return (
			<div className="navbar">
				<header className="header">
					<h1 className="site-title"><Link className="site-title-link" to="/pomnyun-tube/build/">Pomnyun Tube</Link></h1>
					<a className="navbar-button" onClick={this.navbarButtonClick} aria-pressed={this.state.navIsActive}><span className="blind"></span></a>
				</header>
				<nav className="navbar-area" aria-expanded={this.state.navIsActive}>
					{/*  Link 컴포넌트를 이용해 url을 "/"로 변경하고 홈 화면을 렌더링 */}
					<ul className="navbar-list">
						<li className="navbar-item"><Link className="navbar-link" to="/pomnyun-tube/build/home">홈</Link></li>
						<li className="navbar-item"><Link className="navbar-link" to="/pomnyun-tube/build/search">키워드검색</Link></li>
						<li className="navbar-item"><Link className="navbar-link" to="/pomnyun-tube/build/category/company">직장문제</Link></li>
						<li className="navbar-item"><Link className="navbar-link" to="/pomnyun-tube/build/category/family">가족문제</Link></li>
						<li className="navbar-item"><Link className="navbar-link" to="/pomnyun-tube/build/category/love">연애문제</Link></li>
					</ul>
				</nav>
			</div>
		)
	}

}

export default Navbar;

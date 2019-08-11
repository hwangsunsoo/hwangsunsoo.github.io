import React, { Component } from 'react';
import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';//bootstrap css를 사용하기 위해서 불러옵니다.
import Navbar from './component/navbar/Navbar.js';
import MainView from './container/MainView.js';
import {Switch, Route } from 'react-router-dom'//router를 사용하기 위해서 react router dom 불러옵니다.
import Search from './container/Search';
import Category from './container/Category';

//router를 감싸고 있는 함수형 컴포넌트
const Main =()=>(//라우팅할때 url이 중복되는것을 막기 위해서 switch 사용
		<Switch>
      {/* 
          "/" 을 가지는 /serach, /view/:id로 이동을 하면 "/"이 포함되어있기 때문에 MainView또한 렌더링이 됩니다.
          이것을 막기 위해서 exact속성을 추가 합니다.
      */}
			<Route exact path="/" component={MainView}></Route>
      <Route exact path="/home" component={MainView}></Route>
      <Route exact path="/search" component={Search}></Route>
      <Route exact path="/category/:id" component={Category}></Route>
		</Switch>
	)

class App extends Component {
  render() { 
    return (
      <div className="app">
        {/* 네이게이션바 컴포넌트*/}
        <Navbar />
        {/* 라우터를 가지고 있는 컴포넌트*/}
        <Main />
      </div>
    );
  }
}

export default App;

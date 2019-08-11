import React, { Component } from 'react';
import FullContent from '../component/fullcontent/FullContent.js';
import ContentList from '../component/contentList/ContentList';

export default class Category extends Component {
    state = {
        fullContent: {"id":"lZjDE0auEMY","channel":"","name":""},
        contents: [],
        keyword: this.props.location.pathname.replace('/category/',''),
        error: {}
    };
    componentDidMount() {
        this.fatchSearch(this.state.keyword);
    }
    componentDidUpdate(prevProps, prevState) {
        if(this.props.location.pathname.replace('/category/','') !== prevProps.location.pathname.replace('/category/',''))
            this.fatchSearch(this.props.location.pathname.replace('/category/',''));
    }
    handleFullContentChange = (content) => {
        this.setState({
            fullContent:content
        })
    }
    setContents = (keyword) => {
        let list = [];
        if(keyword === 'test') {
            list = [{"id":"DEBdmlxhGIE","channel":"법륜스님의 희망세상만들기","name":"유튜브로만 스님을 뵙는데 저도 수행할 수 있을까요?"},{"id":"xXo6wJeznmY","channel":"법륜스님의 즉문즉설","name":"제499회 자기 변화를 위한 수행(법문)"},{"id":"DNH1EQe7hww","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1195회] 수행은 참는 것이 아니다"},{"id":"ucvPMs-3sSA","channel":"법륜스님의 즉문즉설","name":"제364회 법륜스님의 수행법"},{"id":"5BWwt2M84s0","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 1138회]  수행법문"},{"id":"Z_50pwGSWac","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1147회] 욕망은 욕망인줄 알아차리면 된다"},{"id":"aHGDctFxVQw","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1142회] 싫어하는 사람에 대한 분별심을 어떻게 다스려야 할까요?"},{"id":"t0xNhmbfpR0","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1043회] 깨달음이란 무엇인가?"},{"id":"Mc3LlyDDhrg","channel":"법륜스님의 즉문즉설","name":"제416회 스님들이 오랜동안 수행하면, 신통력이 생긴다"},{"id":"v3TYDfdsdTk","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 제 1407회] 수행해서 좋아진 줄 알았는데..."},{"id":"Y-LMu1B5wP4","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처님 이야기] 2 깨달음은 스스로 알아차리는 것"},{"id":"o9Ao5NMIYW0","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1145회]명상은 왜 하는지, 하면 무엇을 얻는지 궁금합니다"},{"id":"Dk0aTCEMv4o","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1139회]수행법문2"},{"id":"Ygl_tEQATSI","channel":"법륜스님의 즉문즉설","name":"제523회 수행 맛보기(법문)"},{"id":"ljsqr8i0dEQ","channel":"법륜스님의 즉문즉설","name":"제429회 적게 먹겠다고 결심을 하지만 음식의 유혹에"},{"id":"q5uJH4CztMc","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처님 이야기] 42 화는 자기 자신을 해친다"},{"id":"O0nBFkGcoTg","channel":"법륜스님의 즉문즉설","name":"제376회 수행에 어려움이 있을 때"},{"id":"rRocyt3drQo","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1152회] 고락의 윤회에서 벗어나는 것이 해탈이다"},{"id":"MhbHL8lOhcM","channel":"법륜스님의 즉문즉설","name":"제506회 건강과 수행"},{"id":"eRGiQn5QMqQ","channel":"법륜스님의 즉문즉설","name":"제365회 일과 수행이 같은 도리"},{"id":"Hn9lxo25kx8","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1143회] 염불수행에 관심이 많은데 어떻게 하는지 궁금합니다"},{"id":"q-LzNsnjA1E","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 1162회] 정토회 봉사가 수행보다 일로 다가옵니다"},{"id":"X-6Jk2J_xVw","channel":"법륜스님의 즉문즉설","name":"제634회 화 내는 습관이 수행을 해도 잘 없어지지 않습니다."},{"id":"HeBsIKERkEU","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1158회]호랑이에게 물려가도 행복할 수 있다"},{"id":"MkfBRXgsM40","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 1249회] 3년만 출가해서 마음공부 해보고 싶어요"},{"id":"afWkSnAGN9A","channel":"법륜스님의 즉문즉설","name":"제310회 기도하는 법"},{"id":"CMHvr1ZtbNA","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처님이야기] 61화. 고통받는 사람들의 구원자이자 희망인 부처님"},{"id":"YKN69BBi510","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처님이야기] 70화.  매일 정진해야 하는 이유"},{"id":"GAWx-NHGL-o","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 제1275회] 강한 의지와 정신력으로 삶을 살아보고 싶습니다."},{"id":"pG0EVNjro9g","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1189회] 그만두는 업식"},{"id":"FB37ofipMEY","channel":"법륜스님의 즉문즉설","name":"[법륜스님의 즉문즉설 제1281회] 바르다는게뭔가요?"},{"id":"BmcCGU8eb_s","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1207회] 마음이 힘들 때 우울증 극복하는 방법"},{"id":"LatIdLfcP-A","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처이야기] 39 게으르지 말고 부지런히 정진하라"},{"id":"-j-eSpASSdM","channel":"한국불교 대표방송 BTN","name":"[BTN]법륜스님이 전하는 &quot;이 세상의 가장 큰 선물&quot;(성도재일)"},{"id":"Z1pm57LO8c0","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1156회] 성당에 다니고 있는데 절에 다녀도 될까요?"},{"id":"hPYYoXshcCk","channel":"법륜스님의 즉문즉설","name":"제541회 스님께서는 어떤 계기로 자기 마음을 보셨나요?"},{"id":"5hGlKT4Ds24","channel":"법륜스님의 희망세상만들기","name":"[법륜스님의 부처이야기] 15 ‘오라 비구여! 여기 법이 잘 설해져 있도다.&#39;"},{"id":"CUOv_aiSIG4","channel":"법륜스님의 즉문즉설","name":"제638회 가족간에 즉문즉설처럼 서로 지적하는 것이 수행에 도움이 될까요?"},{"id":"wk7V0TU5_EM","channel":"법륜스님의 즉문즉설","name":"[법륜스님 즉문즉설 1150회] 아버지가 자기주장이 강해서 만나면 불편합니다"}];
        }
        console.log(keyword, list);
        return list
    }
    fatchSearch(keyword) {
        this.setState({ contents: this.setContents(keyword) });
    }
    render() {
        return (
            <div className="category-page">
                <FullContent content={this.state.fullContent}/>
                <ContentList contents={this.state.contents} onClick={this.handleFullContentChange} />
            </div>
        )
    }
}

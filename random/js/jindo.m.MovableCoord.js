/**
	터치에 따라 가속도와 튕김효과가 적용되어 움직이는 좌표를 관리하는 컴포넌트

	@author hooriza
	@version #__VERSION__#

	@class jindo.m.MovableCoord
	@extends jindo.m.Component
	@uses jindo.m.Touch, jindo.m.Effect

	@keyword Touch, 가속도
	@group Component

	@history 1.14.0 Release 최초 릴리즈
**/
jindo.m.MovableCoord = jindo.$Class({

	/**
		컴포넌트 생성자

		@constructor

		@param {Array} aPos 초기 좌표값
		@param {Object} [oOptions] 옵션
			@param {Number} [oOptions.nDeceleration=0.0006] 감속도
			@param {Array} [oOptions.aMin=[0,0]] 가능한 좌표의 최저값
			@param {Array} [oOptions.aMax=[100,100]] 가능한 좌표의 최대값
			@param {Array} [oOptions.aBounce=[10,10,10,10]] 튕기는 좌표 간격 (순서대로 상, 우, 하, 좌를 뜻함)
			@param {Array} [oOptions.aMargin=[10,10,10,10]] 사용자가 붙잡고 이동 할 수 있는 최대 좌표 간격 (순서대로 상, 우, 하, 좌를 뜻함)
			@param {Array} [oOptions.aCircular=[false,false,false,false]] 좌표값이 해당 방향을 넘어갔을 때 반대편으로 이동하게 할지 여부 (순서대로 상, 우, 하, 좌를 뜻함)
	**/
	$init : function(aPos, oOptions) {

		var self = this;

		this._sRandKey = '__MOVABLECOORD_' + Math.round(Math.random() * new Date().getTime());
		this._aPos = aPos || [ 0, 0 ];

		this.option({
			nDeceleration : 0.0006,
			aMin : [ 0, 0 ],
			aMax : [ 100, 100 ],
			aBounce : [ 10, 10, 10, 10 ],
			aMargin : [ 0, 0, 0, 0 ],
			aCircular : [ false, false, false, false ]
		});

		this.option(oOptions || {});

		this._subOptions = { _htOption:{ _htSetter:{} } };

		setTimeout(function() {
			/**
				포인트의 좌표가 변경 될 때 발생

				@event change
				@param {Array} aPos 좌표
					@param {Number} aPos.0 가로 좌표
					@param {Number} aPos.1 세로 좌표
				@param {Boolean} bHolding 터치로 붙잡고 있을 때 발생하는 이벤트이면 true, 아니면 false
			**/
			self.fireEvent('change', {
				aPos : [self._aPos[0], self._aPos[1]],
				bHolding : false
			});
		}, 0);

	},

	_grap : function() {

		var pos = this._aPos;

		var animating = this._oAnimating;

		// 애니메이션 되고 있는 도중에 붙잡은 경우
		if (animating) {
			this._frame(animating, pos);
			this._oAnimating = null;
			this._oRaf && cancelAnimationFrame(this._oRaf);
			this._oRaf = null;
		}

	},

	/**
		좌표값 변경

		@method setTo

		@param {Number} nX 가로 좌표
		@param {Number} nY 세로 좌표
		@param {Boolean} [bAnimation=false] 움직이는 효과를 주려면 true

		@return {this}
	**/
	/**
		좌표값 변경

		@method setTo

		@param {Number} nX 가로 좌표
		@param {Number} nY 세로 좌표
		@param {Number} nMaximumDuration 움직이는 효과의 최대 시간(ms), 0 일경우 움직이는 효과 없음

		@return {this}
	**/
	setTo : function(nX, nY, nMaximumDuration) {
		var self = this;

		if (nMaximumDuration === true) {
			nMaximumDuration = Infinity;
		}

		this._grap();

		var min = this.option('aMin');
		var max = this.option('aMax');
		var circular = this.option('aCircular');

		if (nMaximumDuration) {
			var pos = [this._aPos[0],this._aPos[1]];
			if (nX !== null) { pos[0] = nX; }
			if (nY !== null) { pos[1] = nY; }
			this._move(pos, false, false, nMaximumDuration);
		} else {

			if (nX !== null) {
				if (!circular[3]) { nX = Math.max(min[0], nX); }
				if (!circular[1]) { nX = Math.min(max[0], nX); }
			}
			if (nY !== null) {
				if (!circular[0]) { nY = Math.max(min[1], nY); }
				if (!circular[2]) { nY = Math.min(max[1], nY); }
			}

			var adjusted = this._adjustCircularPos([ nX, nY ], min, max, circular);

			if (nX !== null) { this._aPos[0] = adjusted[0]; }
			if (nY !== null) { this._aPos[1] = adjusted[1]; }

			self.fireEvent('change', {
				aPos : [this._aPos[0],this._aPos[1]],
				bHolding : false
			});
		}

		return this;
	},

	/**
		상대적인 위치로 좌표값 변경

		@method setBy

		@param {Number} nX 가로 상대좌표
		@param {Number} nY 세로 상대좌표
		@param {Boolean} [bAnimation=false] 움직이는 효과를 주려면 true

		@return {this}
	**/
	/**
		상대적인 위치로 좌표값 변경

		@method setBy

		@param {Number} nX 가로 상대좌표
		@param {Number} nY 세로 상대좌표
		@param {Number} nMaximumDuration 움직이는 효과의 최대 시간(ms), 0 일경우 움직이는 효과 없음

		@return {this}
	**/

	setBy : function(nXby, nYby, nMaximumDuration) {
		this._grap();

		return this.setTo(
			nXby !== null ? this._aPos[0] + nXby : null,
			nYby !== null ? this._aPos[1] + nYby : null,
			nMaximumDuration
		);
	},

	/**
		현재 좌표값 얻기

		@method get
		@return {Array} 좌표값 [가로, 세로]
	**/
	get : function() {
		return [this._aPos[0],this._aPos[1]];
	},

	/**
		터치에 따라 좌표값을 변화 시킬 수 있는 엘리먼트 지정

		@method bind

		@param {Element} elEl 터치 이벤트를 등록 할 엘리먼트
		@param {Object} [oSubOptions] 옵션
			@param {Number} [oSubOptions.nDirection=1|2|4|8|16] 움직일 수 있는 방향 @TODO
			@param {Array} [oSubOptions.aScale=[1,1]] 이동 배율 [가로, 세로]
			@param {Number} [oSubOptions.nMax=Infinity] 최대 좌표 변화 속도

		@return {this}
	**/
	bind : function(elEl, oSubOptions) {

		var self = this;

		var sRandKey = this._sRandKey;
		elEl = elEl instanceof jindo.$Element ? elEl.$value() : elEl;

		var subOptions = {
			nDirection : 1|2|4|8|16,
			aScale : [ 1, 1 ],
			nMaximumSpeed : Infinity
		};

		if (oSubOptions) {
			for (var k in oSubOptions) if (oSubOptions.hasOwnProperty(k)) {
				subOptions[k] = oSubOptions[k];
			}
		}

		if (elEl[sRandKey]) {
			this.unbind(elEl);
		}

		var nUseDiagonal = (
			subOptions.nDirection & 16 ? 2 : (
				((subOptions.nDirection & 2) || (subOptions.nDirection & 8)) ? 1 : 0
			)
		);

		var bVertical = (subOptions.nDirection & 4) || (subOptions.nDirection & 8);
		var bHorizental = (subOptions.nDirection & 1) || (subOptions.nDirection & 2);

		elEl[sRandKey] = new jindo.m.Touch(elEl, {
			nDeceleration : this.option('nDeceleration'),
			nUseDiagonal : nUseDiagonal, // subOptions.nUseDiagonal,
			nMoveThreshold : 0,
			nSlopeThreshold : 5,
			nTapThreshold  : 1,
			bHorizental : !!bHorizental, // subOptions.bHorizontal,
			bVertical : !!bVertical // subOptions.bVertical
		}).attach({
			touchStart : function(oCustomEvent) {
				self._subOptions = subOptions;
				self._touchStart(oCustomEvent);
			},
			touchMove : function(oCustomEvent) { self._touchMove(oCustomEvent); },
			touchEnd : function(oCustomEvent) { self._touchEnd(oCustomEvent); }
		});

		return this;

	},

	/**
		터치에 따라 좌표값을 변화 시킬 수 있도록한 엘리먼트의 해제

		@method unbind

		@param {Element} elEl 터치 이벤트를 등록 한 엘리먼트
		@return {this}
	**/
	unbind : function(elEl) {

		var sRandKey = this._sRandKey;
		elEl = elEl instanceof jindo.$Element ? elEl.$value() : elEl;

		if (elEl[sRandKey]) {
			elEl[sRandKey].deactivate();
			elEl[sRandKey] = null;
		}

		return this;
	},

	_touchStart : function(oCustomEvent) {

		// var _ = new Date();

		var pos = this._aPos;
		var min = this.option('aMin');
		var max = this.option('aMax');

		var animating = this._oAnimating; // 애니메이션 되고 있는 도중에 붙잡은 경우
		animating && this._frame(animating, pos);
		this._oAnimating = null;

		this._oRaf && cancelAnimationFrame(this._oRaf);
		this._oRaf = null;

		/**
			터치 영역을 눌렀을 때 발생

			@event hold
			@param {Array} aPos 좌표
				@param {Number} aPos.0 가로 좌표
				@param {Number} aPos.1 세로 좌표
		**/
		this.fireEvent('hold', { oEvent : oCustomEvent.oEvent, aPos : [pos[0], pos[1]] });

		this._bGrapOutside = pos[0] < min[0] || pos[1] < min[1] || pos[0] > max[0] || pos[1] > max[1];
		this._aMovingPos = [pos[0], pos[1]];

		this._aDirFilter = null;

	},

	_easeOutQuint : jindo.m.Effect.easeOutQuint(0, 1),

	_adjustCircularPos : function(pos, min, max, circular) {

		min = min || this.option('aMin');
		max = max || this.option('aMax');
		circular = circular || this.option('aCircular');

		// aCircular 옵션 있을 때 삐져나갔으면
		if (circular[0] && pos[1] < min[1]) { // 위
			pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + max[1];
		}

		if (circular[1] && pos[0] > max[0]) { // 오른쪽
			pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + min[0];
		}

		if (circular[2] && pos[1] > max[1]) { // 아래
			pos[1] = (pos[1] - min[1]) % (max[1] - min[1] + 1) + min[1];
		}

		if (circular[3] && pos[0] < min[0]) { // 왼쪽
			pos[0] = (pos[0] - min[0]) % (max[0] - min[0] + 1) + max[0];
		}

		return pos;

	},

	_touchMove : function(oCustomEvent) {

		// var _ = new Date();

		if (oCustomEvent.sMoveType === 'tap') { return; }
		if (!this._aMovingPos) { return; }

		var pos = this._aPos;
		var movingPos = this._aMovingPos;

		var min = this.option('aMin');
		var max = this.option('aMax');
		var bounce = this.option('aBounce');
		var margin = this.option('aMargin');

		var direction = this._subOptions.nDirection;
		var scale = this._subOptions.aScale;

		var easeOutQuint = this._easeOutQuint; // top
		var mul = 5/*easeOutQuint*/ * (1.5 || 1);

		// Math.min/Math.max 보다 빠른 속도를 위한 임시 변수
		var tv, tn, tx;

		// if (!this._dragging) {
		// 	this._dragging = {
		// 		pos : pos
		// 	};
		// }

		// var pos = this._dragging.pos;

		// console.log('touchMove', oCustomEvent.sMoveType);

		// console.log(oCustomEvent.sMoveType, direction, [ oCustomEvent.nVectorX, oCustomEvent.nVectorY ], oCustomEvent);

		var aDirFilter = this._aDirFilter;

		// console.log(
		// 	oCustomEvent.sStartMoveType
		// );

		if (!aDirFilter) {
			aDirFilter = this._aDirFilter = [ false, false ];

			switch (oCustomEvent.sStartMoveType) {
			case 'hScroll':
				aDirFilter[0] = direction & 1;
				aDirFilter[1] = direction & 2;
				break;
			case 'vScroll':
				aDirFilter[1] = direction & 4;
				aDirFilter[0] = direction & 8;
				break;
			case 'dScroll':
				aDirFilter[0] = aDirFilter[1] = direction & 16;
				break;
			}
		}

		if (aDirFilter[0]) { movingPos[0] += oCustomEvent.nVectorX * scale[0]; }
		if (aDirFilter[1]) { movingPos[1] += oCustomEvent.nVectorY * scale[1]; }

		// console.log(
		// 	oCustomEvent.sStartMoveType,
		// 	oCustomEvent.nVectorX, oCustomEvent.nVectorY
		// );

		pos[0] = movingPos[0], pos[1] = movingPos[1];
		pos = this._adjustCircularPos(pos, min, max);

		// 밖에서 붙잡았는데 안으로 들어온 경우 flag 변경
		if (this._bGrapOutside && pos[0] >= min[0] && pos[0] <= max[0] && pos[1] >= min[1] && pos[1] <= max[1]) {
			this._bGrapOutside = false;
		}

		var mb0 = margin[0] + bounce[0];
		var mb1 = margin[1] + bounce[1];
		var mb2 = margin[2] + bounce[2];
		var mb3 = margin[3] + bounce[3];

		// 밖에서 붙잡은 경우 그냥 이동
		if (this._bGrapOutside) {

			tn = min[0]-mb3, tx = max[0]+mb1, tv = pos[0];
			pos[0] = tv>tx?tx:(tv<tn?tn:tv);

			tn = min[1]-mb0, tx = max[1]+mb2, tv = pos[1];
			pos[1] = tv>tx?tx:(tv<tn?tn:tv);

		// 안에서 붙잡은 경우 삐져나간 비율에 맞추어 이동
		} else {

			if (pos[1] < min[1]) { // 위로 삐져나옴
				tv = (min[1]-pos[1])/(mb0*mul);
				pos[1] = min[1]-easeOutQuint(tv>1?1:tv)*mb0;
			} else if (pos[1] > max[1]) { // 아래로 삐져나옴
				tv = (pos[1]-max[1])/(mb2*mul);
				pos[1] = max[1]+easeOutQuint(tv>1?1:tv)*mb2;
			}

			if (pos[0] < min[0]) { // 왼쪽으로 삐져나옴
				tv = (min[0]-pos[0])/(mb3*mul);
				pos[0] = min[0]-easeOutQuint(tv>1?1:tv)*mb3;
			} else if (pos[0] > max[0]) { // 오른쪽으로 삐져나옴
				tv = (pos[0]-max[0])/(mb1*mul);
				pos[0] = max[0]+easeOutQuint(tv>1?1:tv)*mb1;
			}

		}

		this.fireEvent('change', {
			aPos : pos,
			bHolding : true
		});

		// welBox.css({
		// 	transition : '0',
		// 	transform : 'translate(' + (pos[0]) + 'px,' + (pos[1]) + 'px)'
		// });

		oCustomEvent.oEvent.stopDefault();

		// console.log(new Date() - _);
		// jindo.$('move').innerHTML = new Date().getTime() - _;

	},

	_touchEnd : function(oCustomEvent) {

		// var _ = new Date();
		var self = this;

		if (!this._aMovingPos) { return; }
		// if (!this._dragging) { return; }

		var pos = this._aPos;
		// var min = this.option('aMin');
		// var max = this.option('aMax');
		var bounce = this.option('aBounce');
		var maximumSpeed = this._subOptions.nMaximumSpeed;
		var scale = this._subOptions.aScale;

		var htMomentum = oCustomEvent.htMomentum;

		var aDirFilter = this._aDirFilter || [ false, false ];
		if (!aDirFilter[0]) { htMomentum.nSpeedX = 0; }
		if (!aDirFilter[1]) { htMomentum.nSpeedY = 0; }

		var relPos = this._getRelPosFromSpeed([
			htMomentum.nSpeedX * (htMomentum.nDistanceX < 0 ? -1 : 1) * scale[0],
			htMomentum.nSpeedY * (htMomentum.nDistanceY < 0 ? -1 : 1) * scale[1]
		], maximumSpeed);

		// 마우스 가속도로 인해 이동함
		this._move(relPos, true, false, Infinity);

		// this._dragging = null;
		this._aMovingPos = null;
		this._aDirFilter = null;

		// jindo.$('end').innerHTML = new Date() - _;

	},

	_move : function(pos, bBy, bBounce, nMaximumDuration) {

		var self = this;

		// 마우스 가속도로 인해 이동함
		this[bBy ? '_animateBy' : '_animateTo'](pos, function() {

			// 영역 밖으로 나간상태라서 튕겨나옴
			var expectPos = [];
			var pos = self._aPos;

			var min = self.option('aMin');
			var max = self.option('aMax');

			expectPos[0] = Math.min(max[0], Math.max(min[0], pos[0]));
			expectPos[1] = Math.min(max[1], Math.max(min[1], pos[1]));

			self._animateTo(expectPos, function() {

				/**
					애니메이션이 끝났을 때 발생함.
					@event animationEnd
				**/
				self.fireEvent('animationEnd');
			}, true, false, nMaximumDuration);

		}, bBounce, true, nMaximumDuration);

	},

	// _bindEvents : function() {

	// 	var self = this;

	// 	this._oTouch.attach({
	// 		touchStart : function(oCustomEvent) { self._touchStart(oCustomEvent); },
	// 		touchMove : function(oCustomEvent) { self._touchMove(oCustomEvent); },
	// 		touchEnd : function(oCustomEvent) { self._touchEnd(oCustomEvent); }
	// 	});

	// },

	/**
		속도로 상대적인 위치 구하기
		@param {Array} speeds 시작 속도 (px/ms)
	*/
	_getRelPosFromSpeed : function(speeds, maximumSpeed) {
		var acceleration = -this.option('nDeceleration');

		var normalSpeed = Math.min(maximumSpeed || Infinity, Math.sqrt(speeds[0]*speeds[0]+speeds[1]*speeds[1]));
		var duration = Math.abs(normalSpeed / acceleration);

		return [
			speeds[0]/2 * duration,
			speeds[1]/2 * duration
		];
	},

	// 상대적인 위치로 duration 구하기
	_getDurationFromRelPos : function(relPos) {
		var acceleration = this.option('nDeceleration');
		var normalPos = Math.sqrt(relPos[0]*relPos[0]+relPos[1]*relPos[1]);

		return Math.sqrt(normalPos / acceleration * 2);
	},

	_getPointOfIntersection : function(depaPos, destPos, boxLT, boxRB, circular) {

		destPos = [destPos[0], destPos[1]];
		var xd = destPos[0]-depaPos[0], yd = destPos[1]-depaPos[1];

		if (!circular[3]) { destPos[0] = Math.max(boxLT[0], destPos[0]); }
		if (!circular[1]) { destPos[0] = Math.min(boxRB[0], destPos[0]); }
		// destPos[0] = Math.max(boxLT[0], Math.min(boxRB[0], destPos[0]));
		destPos[1] = xd ? depaPos[1]+yd/xd*(destPos[0]-depaPos[0]) : destPos[1];

		if (!circular[0]) { destPos[1] = Math.max(boxLT[1], destPos[1]); }
		if (!circular[2]) { destPos[1] = Math.min(boxRB[1], destPos[1]); }
		// destPos[1] = Math.max(boxLT[1], Math.min(boxRB[1], destPos[1]));
		destPos[0] = yd ? depaPos[0]+xd/yd*(destPos[1]-depaPos[1]) : destPos[0];

		// destPos[0] = Math.round(destPos[0]);
		// destPos[1] = Math.round(destPos[1]);

		return destPos;

	},

	// 애니메이션 진행 (상대적인 위치)
	_animateBy : function(relPos, callback, isBounce, whenRelease, nMaximumDuration) {

		var pos = this._aPos;

		return this._animateTo([
			pos[0] + relPos[0],
			pos[1] + relPos[1]
		], callback, isBounce, whenRelease, nMaximumDuration);

	},

	// 애니메이션 진행 (절대적인 위치)
	/*
		@param isBounce {Boolean} 튕기는것 땜에 움직이는 경우
	*/
	_animateTo : function(absPos, callback, isBounce, whenRelease, nMaximumDuration) {

		var self = this;
		var pos = this._aPos;

		var bounce, margin, circular, min, max;
		var destPos = [ absPos[0], absPos[1] ];

		bounce = this.option('aBounce'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		margin = this.option('aMargin'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		circular = this.option('aCircular'); // 순환 방향 (상[0], 우[1], 하[2], 좌[3])
		min = this.option('aMin');
		max = this.option('aMax');

		// margin 영역 밖으로 나가지 않도록 제한
		destPos = this._getPointOfIntersection(pos, destPos, [
			min[0]-bounce[3], min[1]-bounce[0]
		], [
			max[0]+bounce[1], max[1]+bounce[2]
		], circular);

		var oParam = {
			aDepaPos : [pos[0],pos[1]],
			aDestPos : destPos,
			bBounce : isBounce
		};

		if (!isBounce) {
			/**
				터치 영역을 놓았을 때 발생

				@event release
				@param {Array} aDepaPos 현재 좌표
					@param {Array} aDepaPos.0 가로 좌표
					@param {Array} aDepaPos.1 세로 좌표

				@param {Array} aDestPos 바뀌어야 할 좌표
					@param {Array} aDestPos.0 가로 좌표
					@param {Array} aDestPos.1 세로 좌표
			**/
			this.fireEvent('release', oParam);
		}

		bounce = this.option('aBounce'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		margin = this.option('aMargin'); // 튕기는 영역 (상[0], 우[1], 하[2], 좌[3])
		min = this.option('aMin');
		max = this.option('aMax');

		destPos = oParam.aDestPos;

		var bCircular = (
			(circular[0] && destPos[1] < min[1]) ||
			(circular[1] && destPos[0] > max[0]) ||
			(circular[2] && destPos[1] > max[1]) ||
			(circular[3] && destPos[0] < min[0])
		);

		// 시작점이 튕기는 영역 밖이면 애니메이션 안함
		// if (!isBounce && (pos[0] < min[0] || pos[1] < min[1] || pos[0] > max[0] || pos[1] > max[1])) {
		// 	destPos = [pos[0],pos[1]];
		// } else {
		// 	// bounce 영역 밖으로 나가지 않도록 제한
		// 	destPos = this._getPointOfIntersection(pos, destPos, [
		// 		min[0]-bounce[3], min[1]-bounce[0]
		// 	], [
		// 		max[0]+bounce[1], max[1]+bounce[2]
		// 	]);
		// }

		// 밖에서 밖으로 움직이는거면 움직이지 않음
		if (
			(pos[0] < min[0] || pos[0] > max[0] || pos[1] < min[1] || pos[1] > max[1]) &&
			(destPos[0] < min[0] || destPos[0] > max[0] || destPos[1] < min[1] || destPos[1] > max[1])
		) {
			// console.log('no move',
			// 	(pos[0] < min[0] || pos[0] > max[0] || pos[1] < min[1] || pos[1] > max[1]),
			// 	(destPos[0] < min[0] || destPos[0] > max[0] || destPos[1] < min[1] || destPos[1] > max[1])
			// );
			destPos = pos;
		}

		// 상대적인 위치 얻기
		var relPos = [ Math.abs(destPos[0]-pos[0]), Math.abs(destPos[1]-pos[1]) ];
		var duration = Math.min(nMaximumDuration, this._getDurationFromRelPos(relPos));

		// duration 이 10ms 미만이면 그냥 애니메이션 안함
		if (duration < 10) { duration = 0; }

		// console.log('duration : ', duration);

		var done = function() {
			self._oAnimating = null;

			pos[0] = Math.round(destPos[0]);
			pos[1] = Math.round(destPos[1]);
			pos = self._adjustCircularPos(pos, min, max, circular);

			callback && callback();
		};

		// duration 이 0 이면 바로 끝내기
		if (!duration) { return done(); }

		oParam = {
			nDuration : duration,
			fEffect : jindo.m.Effect.cubicBezier(0.18, 0.35, 0.56, 1),
			aDepaPos : [pos[0],pos[1]],
			aDestPos : destPos,
			bBounce : isBounce,
			bCircular : bCircular,
			fDone : done
		};

		/**
			애니메이션 시작 직전에 발생함.
			이벤트를 stop 시키면 애니메이션 효과를 직접 구현해야 하며, 애니메이션이 끝났을 경우 fDone 메서드를 호출해야함.

			@event animation
			@stoppable

			@param {Number} nDuration 애니메이션 진행 시간 (ms)
			@param {Function} fEffect 애니메이션 효과 함수

			@param {Array} aDepaPos 시작 좌표
				@param {Number} aDepaPos.0 가로 좌표
				@param {Number} aDepaPos.1 세로 좌표

			@param {Array} aDestPos 종료 좌표
				@param {Number} aDestPos.0 가로 좌표
				@param {Number} aDestPos.1 세로 좌표

			@param {Boolean} bBounce 튕겨서 움직이는 애니메이션이면 true
			@param {Boolean} bCircular 순환하여 움직여야 하는 애니메이션이면 true (이 값이 true 일 경우 애니메이션을 커스터마이징하기 위해서 이벤트를 stop 하는 것이 불가능하다)
			@param {Function} fDone 이벤트를 stop 한 경우에만 사용되며, 애니메이션이 끝났다는 걸 알려주기 위해 호출하는 함수
		**/
		var retFire = this.fireEvent('animation', oParam);

		// bCircular 가 true 인데 이벤트 stop 했으면
		if (bCircular && !retFire) {
			throw new Error("Can't stop the 'animation' event when 'bCircular' is true.");
		}

		oParam.aDepaPos = pos;
		oParam.nStartTime = new Date().getTime();

		this._oAnimating = oParam;

		if (retFire === true) {

			var animating = this._oAnimating;

			(function loop() {
				self._oRaf = null;
				if (self._frame(animating) >= 1) { return done(); } // 애니메이션 끝
				self._oRaf = requestAnimationFrame(loop);
			})();

		}

	},

	_frame : function(animating, pos) {

		// 시간이 얼마나 흘렀는지 구하기
		var per = Math.min(1, (new Date() - animating.nStartTime) / animating.nDuration);
		pos = pos || [];

		// 시간이 얼마나 흘렀는지에 따른 위치 구하기
		pos[0] = animating.fEffect(animating.aDepaPos[0], animating.aDestPos[0])(per)*1;
		pos[1] = animating.fEffect(animating.aDepaPos[1], animating.aDestPos[1])(per)*1;

		pos = this._adjustCircularPos(pos);

		this.fireEvent('change', {
			aPos : pos,
			bHolding : false
		});

		return per;

	}

}).extend(jindo.m.Component);

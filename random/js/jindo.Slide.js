jindo.Slide = jindo.$Class({

	/**
		@constructor

		@param {HTMLElement} elWrap 엘리먼트
		@param {Object} [oOptions] 옵션
			@param {Boolean} [oOptions.bFixed=false] 고정형 슬라이드를 만드려면 true, 아니면 false
			@param {Boolean} [oOptions.bHorizontal=true] 가로로 변화하는 슬라이드이면 true, 아니면 false
			@param {Number} [oOptions.nContentCount=null] 컨텐츠의 갯수 (null 로 지정하면 마크업에 존재하는 갯수만큼 설정)
			@param {Boolean} [oOptions.bCircular=false] 순환 슬라이드로 만들꺼면 true, 아니면 false
			@param {Number} [oOptions.nBufferNum=1] 앞뒤로 여유를 두어 컨텐츠를 준비 할 수 있도록 하는 버퍼 갯수
	*/
	$init : function(elWrap, oOptions) {

		var self = this;
		var style = document.body.style;

		this._bInitialized = false;

		this._nPos = 0;
		this._nCurIdx = null;

		this._oTimer = null;

		this.option({
			bFixed : false,
			bHorizontal : true,
			bUseTransform : (
				style.transform != undefined ||
				style.WebkitTransform != undefined ||
				style.MozTransform != undefined ||
				style.OTransform != undefined ||
				style.msTransform != undefined
			),
			nContentCount : null,
			bCircular : false,
			nBufferNum : 1,
			sAlignment : 'left',
			bForceAlignment : false
		});

		this.option(oOptions || {});

		this._elWrap = jindo.$(elWrap);
		this._welWrap = jindo.$Element(elWrap);

		this._welList = this._welWrap.query('.list');
		this._aItems = jindo.$$('.item', this._elWrap);

		if (this.option('bHorizontal')) {
			this._oKeys = {
				pos : 'left', Pos : 'Left',
				size : 'width', Size : 'Width',
				xy : 'x', XY : 'X'
			};
		} else {
			this._oKeys = {
				pos : 'top', Pos : 'Top',
				size : 'height', Size : 'Height',
				xy : 'y', XY : 'Y'
			};
		}

		var sKey = self.option('bHorizontal') ? 0 : 1;

		this._oMC = new jindo.m.MovableCoord([ 0, 0 ]).bind(this._elWrap, {
			nDirection : this.option('bHorizontal') ? 1 : 4,
			aScale : [ -1, -1 ]
		}).attach({

			'change' : function(oCustomEvent) {
				self._nPos = oCustomEvent.aPos[sKey];
				self._setToPx(self._nPos);
			},

			'release' : function(oCustomEvent) {

				var nContentCount = self.option('nContentCount');
				var bCircular = self.option('bCircular');

				var aPos = oCustomEvent.aDestPos;
				var nIdx = self._fromPosToIdx(aPos[sKey]);

				if (bCircular) {
					nIdx = Math.round(nIdx); //  % self.option('nContentCount');
					aPos[sKey] = self._fromIdxToPos(nIdx); 
				} else if (0 <= nIdx && nIdx <= self.option('nContentCount') - 1) {
					nIdx = Math.round(nIdx);
					aPos[sKey] = self._fromIdxToPos(nIdx); 
				} else {
					nIdx = Math.max(0, Math.min(self.option('nContentCount') - 1, nIdx));
				}

				// self._setCurIdx(nIdx);

			},

			'animation' : function(oCustomEvent) {
				oCustomEvent.fEffect = jindo.m.Effect.cubicBezier(.32, .89, .24, 1);
			},

			'animationEnd' : function() {

				var nIdx = self._fromPosToIdx(self._nPos);
				self._setCurIdx(nIdx);

				self.fireEvent('animationEnd');

			}
		});

	},

	_setCurIdx : function(nIdx) {

		this._nCurIdx = nIdx;

		var contentIdx = this.get();
		if (this._nBefContentIdx !== contentIdx) {

			var aItems = this._aItems;
			var itemIdx = contentIdx % this._nItemCount;

			this.fireEvent('change', {
				elItem : aItems[itemIdx],
				nItemIndex : itemIdx,
				nContentIndex : contentIdx
			});

			// console.log('>>>', contentIdx);

			this._nBefContentIdx = contentIdx;
		}

	},

	_revolvingDefence : function(itemCount, contentCount, itemWidth, clientWidth, isCircular, bufferNum, setPos, setKeyframe, setContent, setVisible) {

		var itemIdxToContentIdx = [], itemIdxToRawIdx = [];

		var rates = new Array(itemCount);
		var visibles = new Array(itemCount);

		for (var i = 0; i < itemCount; i++) {
			itemIdxToContentIdx[i] = itemIdxToRawIdx[i] = i;
			visibles[i] = true;
		}

		// 버퍼를 포함하여 현재 보이는 contents 영역의 인덱스 (처음에는 아무것도 안 보이는 걸로 초기화)
		var beforeBufferRawIdxes = [ Infinity, -Infinity ];

		var _beforePos = 0;

		return function(_pos) {

			var pos = [ _pos, _pos + clientWidth - 1 ];

			// 보이는 content 영역의 인덱스
			var currentRawIdxes = [
				(pos[0]) / itemWidth,
				(pos[1]+1) / itemWidth
			];

			///////////////////////////////// VISIBLE

			if (setVisible) {

				var showDirection = _pos >= _beforePos ? 1 : -1;
				_beforePos = _pos;

				var modedIdxes = [
					Math.floor(currentRawIdxes[0]),
					Math.floor(currentRawIdxes[1])
				];

				var startItemIdx = modedIdxes[0] % itemCount;
				startItemIdx = startItemIdx < 0 ? itemCount + startItemIdx : startItemIdx;

				var gapItemIdx2RawIdx = Math.ceil((modedIdxes[0]+1) / itemCount) * itemCount;

				for (var i = 0; i < itemCount; i++) {

					var rawIdx = i + gapItemIdx2RawIdx - (i < startItemIdx ? 0 : itemCount);
					var visible = modedIdxes[0] <= rawIdx && rawIdx <= modedIdxes[1];

					if (visibles[i] !== visible) {
						setVisible(rawIdx, i, visible ? showDirection : 0);
						visibles[i] = visible;
					}

				}

			}

			///////////////////////////////// VISIBLE

			// var foo = [].concat(currentRawIdxes);
			// foo[0] = Math.floor(foo[0]);
			// foo[1] = Math.ceil(foo[1]);

			currentRawIdxes[0] = Math.floor(currentRawIdxes[0]) - (currentRawIdxes[0] % 1 ? 0 : 1);
			currentRawIdxes[1] = Math.floor(currentRawIdxes[1]) + (currentRawIdxes[1] % 1 ? 0 : 1);

			// 버퍼를 포함한 보이는 content 영역의 인덱스
			var currentBufferRawIdxes = [
				currentRawIdxes[0] - bufferNum,
				currentRawIdxes[1] + bufferNum
			];

			if (setKeyframe) {

				// 이전에 보였던 부분
				for (var rawIdx = beforeBufferRawIdxes[0]; rawIdx <= beforeBufferRawIdxes[1]; rawIdx++) {

					// 지금도 보이는 부분이면 무시함
					if (currentBufferRawIdxes[0] <= rawIdx && rawIdx <= currentBufferRawIdxes[1]) {
						continue;
					}

					var itemIdx = rawIdx % itemCount;
					itemIdx = itemIdx < 0 ? itemCount + itemIdx : itemIdx;

					if (rates[itemIdx] !== 0) {
						setKeyframe(rawIdx, itemIdx, 0);
						rates[itemIdx] = 0;
					}

				}

			}

			var rate;

			// 지금 보이는 부분
			for (var rawIdx = currentBufferRawIdxes[0]; rawIdx <= currentBufferRawIdxes[1]; rawIdx++) {

				// 비순환 플리킹이고 갯수내 영역이 아니면 무시
				if (!isCircular && (rawIdx < 0 || contentCount <= rawIdx)) {
					continue;
				}

				var itemIdx = rawIdx % itemCount;
				itemIdx = itemIdx < 0 ? itemCount + itemIdx : itemIdx;

				if (setKeyframe) {

					if (rawIdx < currentRawIdxes[0] || currentRawIdxes[1] < rawIdx) { // 이하 현재 보이는 영역 밖에 있으면
						rate = 0;
					} else if (rawIdx === currentRawIdxes[0]) {
						rate = Math.round(((pos[0] - (itemWidth * rawIdx)) / itemWidth / -2 + 0.5) * 100000000) / 100000000;
					} else if (rawIdx === currentRawIdxes[1]) {
						rate = Math.round(((pos[1] - (itemWidth * rawIdx + itemWidth)) / itemWidth / -2 + 0.5) * 100000000) / 100000000;
					} else {
						rate = 0.5;
					}

					// rate 가 바뀌어야 하는 경우
					if (rates[itemIdx] !== rate) {
						setKeyframe(rawIdx, itemIdx, rate);
						rates[itemIdx] = rate;
					}

				}

				var contentIdx = rawIdx % contentCount;
				contentIdx = contentIdx < 0 ? contentCount + contentIdx : contentIdx;

				// 위치가 바뀌어야 하는 경우
				if (setPos && itemIdxToRawIdx[itemIdx] != rawIdx) {
					setPos(rawIdx, itemIdx);
					itemIdxToRawIdx[itemIdx] = rawIdx;
				}

				// 컨텐츠가 바뀌어야 하는 경우
				if (itemIdxToContentIdx[itemIdx] != contentIdx) {
					setContent(rawIdx, itemIdx, contentIdx);
					itemIdxToContentIdx[itemIdx] = contentIdx;
				}

			}

			beforeBufferRawIdxes = currentBufferRawIdxes;

		}

	},

	_setPos : function(welEl, nPos) {

		var oKeys = this._oKeys;

		if (this.option('bUseTransform')) {
			welEl.css('transform', 'translate' + oKeys.XY + '(' + nPos + 'px)');
		} else {
			welEl.css(oKeys.pos, Math.round(nPos) + 'px');
		}

	},

	_initItemsPosition : function() {

		var self = this;

		var oKeys = this._oKeys;
		var aItems = this._aItems;

		var nItemCount = aItems.length;
		var nWrapSize = this._nWrapSize = this._elWrap['client' + oKeys.Size];
		var nItemSize = this._nItemSize = aItems[0]['offset' + oKeys.Size];

		var bCircular = this.option('bCircular');
		var bFixed = this.option('bFixed');

		var bUseKeyframe = this._htEventHandler.setKeyframe && this._htEventHandler.setKeyframe.length;
		var bUseVisible = this._htEventHandler.changeVisible && this._htEventHandler.changeVisible.length;

		var nContentCount = this.option('nContentCount');
		if (nContentCount === null) {
			this.option('nContentCount', nContentCount = nItemCount);
		}

		// nContentCount 가 nItemCount 보다 작을 때 숨기기
		for (var i = 0; i < nItemCount; i++) {
			this._aItems[i].style.display = i >= nContentCount ? 'none' : '';
		}

		this._nItemCount = nItemCount = Math.min(nItemCount, nContentCount);

		if (!bFixed) {
			for (var i = 0, nLen = nItemCount; i < nLen; i++) {
				self._setPos(jindo.$Element(aItems[i]), Math.round(i * nItemSize));
			}
		}

		this._oRevolving = this._revolvingDefence(
			nItemCount, nContentCount,
			nItemSize, nWrapSize,
			bCircular, this.option('nBufferNum'),
			bFixed ? null : function setPos(rawIdx, itemIdx) {
				self._setPos(jindo.$Element(aItems[itemIdx]), Math.round(rawIdx * nItemSize));
			}, bUseKeyframe ? function setKeyframe(rawIdx, itemIdx, rate) {

				// console.log('setKeyframe', arguments);

				self.fireEvent('setKeyframe', {
					elItem : aItems[itemIdx],
					nItemIndex : itemIdx,
					nRate : rate
				});

			} : null,
			function setContent(rawIdx, itemIdx, contentIdx) {

				// console.log('setContent', arguments);

				self.fireEvent('setContent', {
					elItem : aItems[itemIdx],
					nItemIndex : itemIdx,
					nContentIndex : contentIdx
				});

			},
			bUseVisible ? function setVisible(rawIdx, itemIdx, status) {

				self.fireEvent('changeVisible', {
					elItem : aItems[itemIdx],
					nItemIndex : itemIdx,
					nStatus : status
				});

			} : null
		);

		var sKey = this.option('bHorizontal') ? 0 : 1;

		var sAlignment = this.option('sAlignment');
		var nBase = ({
			left : 0.0,
			center : 0.5,
			right : 1.0
		})[sAlignment];

		var nMin = 0;
		var nMax = nContentCount * nItemSize;

		if (!bCircular) {

			var bForceAlignment = this.option('bForceAlignment');

			nMin = bForceAlignment ? (nItemSize - nWrapSize) * nBase : 0;
			nMax = (
				bForceAlignment ?
				nItemSize * (nContentCount + nBase - 1) - nWrapSize * nBase:
				nItemSize * nContentCount - nWrapSize
			);

		}

		nMin = Math.round(nMin), nMax = Math.round(nMax);

		this._oMC.option({
			aMin : [ nMin, nMin ],
			aMax : [ nMax - (bCircular ? 1 : 0), nMax - (bCircular ? 1 : 0) ],
			aBounce : [ 0, 100, 0, 100 ],
			aMargin : [ 0, 0, 0, 0 ],
			aCircular : [ bCircular, bCircular, bCircular, bCircular ]
		});

		// console.log(nMin, nMax - 1);

	},

	_setToPx : function(nPos) {

		var self = this;
		var nRevolvingPos = nPos;

		var nMaxPos = this.option('nContentCount') * this._nItemSize - this._nWrapSize;
		var bCircular = this.option('bCircular');

		this._oRevolving(nRevolvingPos);

		if (!this.option('bFixed')) {
			this._setPos(this._welList, Math.round(-nPos));
		} else if (!bCircular) {
			if (nPos < 0) {
				this._setPos(this._welList, Math.round(-nPos));
			} else if (nPos > nMaxPos) {
				this._setPos(this._welList, Math.round(nMaxPos - nPos));
			} else {
				this._setPos(this._welList, 0);
			}
		}

		// this._nPos = nPos;

		return this;

	},

	/**
		원하는 인덱스의 컨텐트로 이동한다.
		@method setTo

		@param {Number} nIdx 이동하고자 하는 컨텐트의 인덱스 (실수도 지정 가능)
		@param {Object} [oAnimationOptions] 애니메이션 옵션, 지정하지 않으면 애니메이션 효과 없음
			@param {Number} [oAnimationOptions.nDuration=0] 이동 속도 (단위 : ms)
			@param {Function} [oAnimationOptions.fEffect=jindo.Effect.easeInOut] 애니메이션 효과
			@param {Function} [oAnimationOptions.fOnEnd] 애니메이션이 끝났을때 호출 될 콜백함수

		@return {this}
	*/
	setTo : function(nIdx, nMaximumDuration) {
		return this._setTo(nIdx, nMaximumDuration, true);
	},

	_setTo : function(nIdx, nMaximumDuration, bShortestDistance) {

		if (!this._bInitialized) {
			this._initItemsPosition();
			this._bInitialized = true;
		}

		var nContentCount = this.option('nContentCount');
		var bCircular = this.option('bCircular');

		// var nMaxPos = nContentCount * this._nItemSize - this._nWrapSize;

		if (!bCircular) {
			nIdx = Math.max(0, Math.min(nContentCount - 1, nIdx));
		} else if (bShortestDistance) {

			var nBeforeIdx = this.get();

			var nGap = (nBeforeIdx - nIdx) % nContentCount;
			if (nGap < 0) { nGap += nContentCount; }

			// console.log([ nBeforeIdx - nGap, nBeforeIdx, nBeforeIdx + (nContentCount-nGap) ]);

			if (Math.abs(nGap) < Math.abs(nContentCount-nGap)) { // 앞이 더 가까움
				nIdx = nBeforeIdx - nGap;
			} else { // 뒤가 더 가까움
				nIdx = nBeforeIdx + (nContentCount-nGap);
			}

		}

		var self = this;
		var nPos;

		// var sAlignment = this.option('sAlignment');
		// var nBase = ({
		// 	left : 0.0,
		// 	center : 0.5,
		// 	right : 1.0
		// })[sAlignment];

		nPos = this._fromIdxToPos(nIdx); // (nIdx + nBase) * this._nItemSize - this._nWrapSize * nBase;

		// console.log('#', nPos);

		this._setCurIdx(nIdx);
		this._oMC.setTo(nPos, nPos, nMaximumDuration);

		return this;

	},

	_fromIdxToPos : function(nIdx) {

		var sAlignment = this.option('sAlignment');

		var nBase = ({
			left : 0.0,
			center : 0.5,
			right : 1.0
		})[sAlignment];

		return (nIdx + nBase) * this._nItemSize - this._nWrapSize * nBase;

	},

	_fromPosToIdx : function(nPos) {

		var sAlignment = this.option('sAlignment');

		var nBase = ({
			left : 0.0,
			center : 0.5,
			right : 1.0
		})[sAlignment];

		return Math.round((nPos + this._nWrapSize * nBase) / this._nItemSize - nBase);

	},

	/**
		원하는 상대적인 인덱스의 컨텐트로 이동한다.
		@method setBy

		@param {Number} nIdx 이동하고자 하는 컨텐트의 상대적인 인덱스 (실수도 지정 가능
		@param {Object} [oAnimationOptions] 애니메이션 옵션, 지정하지 않으면 애니메이션 효과 없음
			@param {Number} [oAnimationOptions.nDuration=0] 이동 속도 (단위 : ms)
			@param {Function} [oAnimationOptions.fEffect=jindo.Effect.easeInOut] 애니메이션 효과
			@param {Function} [oAnimationOptions.fOnEnd] 애니메이션이 끝났을때 호출 될 콜백함수

		@return {this}
	*/
	setBy : function(nIdxBy, nMaximumDuration) {
		var nNowIdx = this._fromPosToIdx(this._nPos);
		return this._setTo(nNowIdx + nIdxBy, nMaximumDuration, false);
	},

	/**
		현재 인덱스를 얻는다
		@method get

		@return {Number} 현재 인덱스
	*/
	get : function() {

		var nContentCount = this.option('nContentCount');
		var nRet = this._nCurIdx % nContentCount;
		if (nRet < 0) { nRet += nContentCount; }

		return nRet;

	},

	/**
		슬라이더의 상태를 재계산한다. (일반적으로 슬라이더의 크기에 변경이 생겼을 때 호출하면 된다)
		@method reset

		@return {this}
	*/
	reset : function() {
		this._bInitialized = false;
		this.setTo(this.get());
		return true;
	}

}).extend(jindo.Component);

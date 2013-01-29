/*
 * @author 		︻╦╤─  VILE RAISIN ─╤╦︻
 * @version 	0.1
 * @required 	Underscore.js & jQuery
 * @github		http://github.com/dizzyone/anneliesloos
 * @copyleft 	<3 annelies
*/

var LL = LL || {}; //namespace

(function($){

	/*
	 * @desc Create a new constructor, replaces new statement.
	 * @example construct( Date , ["01/15/2013 09:30:00"] )
	*/
	function construct(cstr) {
		return new (Function.prototype.bind.apply(cstr, arguments))();
	}
	/*
	 * @desc Prefixes single digits with a 0.
	*/
	function formatDigit(d){
		return ( String(d).length == 1 ) ? "0"+d : ""+d;
	}
	/*
	 * @desc Capitalize the first letter of a string.
	*/
	function capFirst(s){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	LL.lastFirst = function(a){
		if( !(a instanceof Array) ) throw "lastFirst() needs an Array to be passed."
		var x = a.pop();
		this.unshift(x);
	};
	LL.firstLast = function(a){
		if( !(a instanceof Array) ) throw "firstLast() needs an Array to be passed."
		var x = a.shift();
		this.push(x);
	};


	/*
	 * @desc Constructor Function that handles all logic for the date, use it to set a date in the future.
	 * @param Array/string - passes parameters to Date(), treat as Date arguments.
	*/
	LL.TillLies = function(tL){
		this.currentTime = new Date();
		this.liesTime = construct( Date , tL );
	};
	LL.TillLies.prototype.timeUnits = { //predefined time units, 1 being a millisecond
		second: 1000,
		minute: 60*1000,
		hour: 60*60*1000,
		day: 60*60*24*1000
	};
	/*
	 * @desc Creates new stored functions that divide the elapsed time (between now and set date),
	 * in all time units defined in the timeUnits object.
	 * @example foo.elapsedSeconds() returns the elapsed time in seconds (number) 
	*/
	LL.TillLies.prototype.initElapsedUnits = function(){
		for( var u in this.timeUnits ){
			this["elapsed"+ capFirst(u) +"s"] = this.elapsedFab( u );
		}
	};
	/*
	 * @desc Subtracts the current time from the set date. In milliseconds.
	 * @return number - elapsed time between now and set date, not absolute.
	*/
	LL.TillLies.prototype.getElapsedTime = function(){
		return (this.liesTime.getTime() - this.currentTime.getTime());
	};
	/*
	 * @desc Returns a new prototype function that divides the given unit with the elapsed time (in milliseconds).
	 * @example foo.elapsedSeconds = foo.elapsedFab( 1000 )
	 * @param number - unit to multiply milliseconds
	 * @return function - returns elapsed time in given unit
	*/
	LL.TillLies.prototype.elapsedFab = function(u){
		return function(){
			return Math.round((this.getElapsedTime() / this.timeUnits[u]));
		};
	};

	/*
	 * @desc An Object that handles all logic for omg rainbows.
	*/
	LL.Rainbow = {
		/*
		 * @desc Takes RGB values (0-255) and converts it into a hashed hex, for use with css.
		 * @example foo.RGBToHash( 255 , 128 , 64 ) => "#ff8040"
		*/
		RGBToHash: function(r,g,b){
			var cA = [];
			_.each( arguments , function(c){
				cA.push( formatDigit( this.bToHex( Math.abs( Number(c) ) ) ) );
			} , this);
			return "#"+cA.join('');
		},
		objToRGBToHash:function(c){
			return this.RGBToHash( c.red , c.green , c.blue );
		},
		/*
		 * @desc Converts bytes into hex.
		 * @example foo.bToHex(255) => "ff"
		*/
		bToHex: _.memoize(function(b){
			return Number(b).toString(16);
		}),
		/*
		 * @desc Returns exactly 120 degrees * m
		*/
		getPI120: _.memoize(function(m){
			var mu = typeof m === 'undefined' ? 1 : m;
			return mu*Math.PI/3;
		}),
		getSteppedFrequency: _.memoize(function(s){
			var step = typeof s === 'undefined' ? 0.21 : s;
			return Math.PI*2/step;
		}),
		getFixedRainbow: function(cObj){
			if(typeof cObj === 'undefined' || typeof cObj !== 'object' ) throw "No Object passed.";
			return function(i){
				if( typeof i === 'undefined' ) throw "No iterator passed.";
				return {
					red: Math.round(Math.sin( cObj.freq[0] * i + cObj.phase[0] ) * cObj.width + cObj.center),
					green: Math.round(Math.sin( cObj.freq[1] * i + cObj.phase[1] ) * cObj.width + cObj.center),
					blue: Math.round(Math.sin( cObj.freq[2] * i + cObj.phase[2] ) * cObj.width + cObj.center),
				};
			};
		},
		createComponents: function(len, freq , phase , width , center ){
			var cObj = {};
			cObj.len = typeof len === 'undefined' ? 64 : len;
			cObj.freq = typeof freq === 'undefined' ? this.getSteppedFrequency(cObj.len) : freq, 
			cObj.phase = typeof phase === 'undefined' ? [0,this.getPI120(2),this.getPI120(4)] : phase,
			cObj.width = typeof width === 'undefined' ? 127 : width,
			cObj.center = typeof center === 'undefined' ? 128 : center;
			if( !(cObj.freq instanceof Array) ) cObj.freq = new Array(cObj.freq,cObj.freq,cObj.freq);
			if( !(cObj.phase instanceof Array) ) cObj.phase = new Array(cObj.phase,cObj.phase,cObj.phase);
			return cObj;
		},
		createRainbowArray: function(cObj){
			var rA = [],
			fR = this.getFixedRainbow( cObj );
			for( var i = 0; i < cObj.len ; i++ ){
				rA.push( this.objToRGBToHash( fR(i) ) );
			}
			return rA;
		}
	};

	LL.HTMLFab = {
		tag: function(tag, content, attributes) {
			return {
				tag: tag,
				content: content,
				attributes: attributes
			};
		},
		render: function(element) {
			var parts = [];
			if(typeof element === "undefined") return;
			function renderAttributes(attributes) {
				var result = [];
				for(var name in attributes) {
					result.push(" " + name + "=\"" + attributes[name] + "\"");
				}
				return result.join("");
			};
			function renderElement(element) {
				var self = this;
				if(typeof element === 'string') {
					parts.push(element);
				} else if(!element.content || element.content.length == 0 || typeof element.content === undefined) {
					parts.push("<" + element.tag + renderAttributes(element.attributes) + "/>")
				} else {
					parts.push("<" + element.tag + renderAttributes(element.attributes) + ">");
					$.each(element.content, function(i, e) {
						renderElement(e);
					});
					parts.push("</" + element.tag + ">");
				}
			};
			renderElement(element);
			return parts.join("");
		}
	};

	LL.Queue = function(r) {
		this.queueArray = [];
		this.repeatable = typeof r === 'undefined' ? false : !!r;
	};
	LL.Queue.prototype.addToQueue = function(func, args) {
		this.queueArray.push(this.wrapCall(func, args));
	};
	LL.Queue.prototype.removeFromQueue = function(i, a) {
		var index = (typeof i === 'number') ? i : 0,
			all = (typeof a === 'undefined') ? false : !!a;
		if(!all) {
			this.queueArray.splice(index, 1);
		} else {
			this.queueArray.splice(index, this.queueArray.length);
		}
	};
	LL.Queue.prototype.wrapCall = function(f, a) {
		var func = f,
			args = a;
		return function() {
			func.apply(this, args);
		};
	};
	LL.Queue.prototype.runQueue = function() {
		var self = this,
		i = this.queueArray.length;
		if(i === 0) return;
		while(i-- > 0) {
			this.queueArray[0]();
			LL.firstLast(this.queueArray);
			if(this.repeatable)continue;
			this.removeFromQueue(i);
		}
	};

	LL.contentData = {
		titleHours:"Hopeloze uurtjes tot Annelies mijn trui komt opeisen:",
		valueHours:"",
		titleMinutes:"Uitzichtloze minuutjes tot Annelies bloosgiebelt:",
		valueMinutes:"",
		titleSeconds:"Troosteloze seconden tot Annelies aan komt fietsen:",
		valueSeconds:""
	}

	//
	// debug
	//
	var fooTime = new LL.TillLies( "01/31/2013 19:01:00" );
	fooTime.initElapsedUnits();
	console.log(fooTime.elapsedHours());
	LL.contentData.valueHours = fooTime.elapsedHours();
	LL.contentData.valueMinutes = fooTime.elapsedMinutes();
	LL.contentData.valueSeconds = fooTime.elapsedSeconds();

	var fooTemplate = _.template( $('.template').html() , LL.contentData , {variable: 'll'} );
	$('.main').prepend( fooTemplate )

	//een goeie manier is waarschijnlijk om eerst de template te nemen, vervolgens de tekst
	//erin plompen, misschien nog escapen en taggen etc.
	//dan pas aan het einde door de template te gaan en de color style toetepassen, op alles
	//behalve tags, tags dus skippen.
	var len = 2003;
	var fooboo = LL.Rainbow.createRainbowArray( LL.Rainbow.createComponents( len,undefined,[4,0,2] ) );
	for( var i = 0; i < len; i++ ){
		$('.main article.hearts').append( '<span style=\"color:'+ fooboo[i]+ '\"> &#9829; </span> ' );
	};

})(jQuery);

if (typeof(jQuery) == "undefined")
{
    throw "You must include jQuery 1.4 or later in order for the hashClick custom binding to work."
}

var HashClickMediator = function() {
    var addEventListener = function (element, eventType, handlerFn){
		if(element.addEventListener){
			element.addEventListener(eventType, handlerFn, false);
		}else if(element.attachEvent){
			element.attachEvent('on' + eventType, handlerFn);
		}
	};

    this.priorHashParams = {};

    this.mappings = {};

    this.updateReady = {};

    this.updateVmFromHash = function() {
        var paramsObj = hashClickHelpers.getHashParamsAsObject(),
            curVal;
        // iterate over the params on the hash query string and update the model if necessary
        for(var p in paramsObj) {
            if(paramsObj.hasOwnProperty(p)) {
                if(this.mappings[p]) {
                    if(typeof this.mappings[p]['vm'][this.mappings[p]['member']] === 'function') { // it's an observable
                        curVal = ko['utils']['unwrapObservable'](this.mappings[p]['vm'][this.mappings[p]['member']]);
                        if(curVal !== paramsObj[p]) {
                            this.mappings[p]['vm'][this.mappings[p]['member']](paramsObj[p]);
                        }
                    }
                    else if(this.mappings[p]['vm'][this.mappings[p]['member']]) {  // we only want to set a member this still exists on the vm
                        this.mappings[p]['vm']['member'] = paramsObj[p];
                    }
                }
            }
        }
        // next we need to iterate over the mappings, and any mapping that did appear in the last hash, but not this one gets set to the stored default
        for(var m in this.mappings) {
            if(this.mappings.hasOwnProperty(m)) {
                // did the mapped param appear in the prior hash and not appear in this hash?
                if(!paramsObj[m] && this.priorHashParams[m]) {
                    // turning off the update-ready status for this member since we're about to set it (only if the value is different than the default)
                    // the change *could* otherwise update the hash (if the binding included "watch", or the value referenced the observable)
                    if(ko.utils.unwrapObservable(this.mappings[m]['vm'][this.mappings[m]['member']]) !== this.mappings[m]['defaultValue']) {
                        this.updateReady[this.mappings[m]['member']] = false;
                    }
                    this.mappings[m]['vm'][this.mappings[m]['member']](this.mappings[m]['defaultValue']);
                }
            }
        }
        this.priorHashParams = paramsObj;
    }.bind(this);

    this['handleEvent'] = function(targetVal, bindingData, viewModel) {
        var paramObj = {},
            paramName = bindingData['substitute'] ? bindingData['substitute'] : bindingData['member'],
            mapObj;
        if(!bindingData['member']) {
            throw "You must include a 'member' value for the hashClick binding to work."
        }
        paramObj[paramName] = targetVal;
        mapObj = { member: bindingData['member'], vm: viewModel };
        if(!this.mappings[bindingData['substitute']]) {
            mapObj.defaultValue = ko['utils']['unwrapObservable'](viewModel[bindingData['member']]); // capture the value prior to hash params causing it to change
            this.mappings[bindingData['substitute']] = mapObj;
        }
        else {
            this.mappings[bindingData['substitute']] = $['extend'](this.mappings[bindingData['substitute']], mapObj);
        }
        hashClickHelpers.mergeOntoHashQueryString(paramObj);
    }.bind(this);

    addEventListener(window, "hashchange", this['updateVmFromHash']);
}

var mediator = new HashClickMediator();

var hashClickHelpers = {

    getHash: function() {
        var urlData = /#(.*)$/.exec( location.href );
        return (urlData && urlData[1])? decodeURIComponent(urlData[1]) : '';
    },

    getHashQueryString: function() {
        var hashData = this.getHash().split('?');
        return (hashData && hashData[1]) ? hashData[1] : '';
    },

    getHashParamsAsObject: function() {
        return this.deparam(this.getHashQueryString(), true);
    },

    setHashQueryString: function(qryStr) {
        var hashData = this.getHash().split('?');
        window.location.hash = qryStr == "" ? qryStr : hashData[0] + "?" + qryStr;
    },

    // Ben Alman's deparam function from the BBQ plugin (license included in the license file.
    // jQuery-BBQ is great plugin if you need additional functionality to store state in
    // conjunction with hash navigation....
    //
    // Section: Deparam (from string)
    //
    // Method: jQuery.deparam
    //
    // Deserialize a params string into an object, optionally coercing numbers,
    // booleans, null and undefined values; this method is the counterpart to the
    // internal jQuery.param method.
    //
    // Usage:
    //
    // > jQuery.deparam( params [, coerce ] );
    //
    // Arguments:
    //
    //  params - (String) A params string to be parsed.
    //  coerce - (Boolean) If true, coerces any numbers or true, false, null, and
    //    undefined to their actual value. Defaults to false if omitted.
    //
    // Returns:
    //
    //  (Object) An object representing the deserialized params string.
    deparam: function( params, coerce ) {
        var obj = {},
          coerce_types = { 'true': !0, 'false': !1, 'null': null };

        // Iterate over all name=value pairs.
        $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
          var param = v.split( '=' ),
            key = decodeURIComponent( param[0] ),
            val,
            cur = obj,
            i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
            keys = key.split( '][' ),
            keys_last = keys.length - 1;

          // If the first keys part contains [ and the last ends with ], then []
          // are correctly balanced.
          if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
            // Remove the trailing ] from the last keys part.
            keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

            // Split first keys part into two parts on the [ and add them back onto
            // the beginning of the keys array.
            keys = keys.shift().split('[').concat( keys );

            keys_last = keys.length - 1;
          } else {
            // Basic 'foo' style key.
            keys_last = 0;
          }

          // Are we dealing with a name=value pair, or just a name?
          if ( param.length === 2 ) {
            val = decodeURIComponent( param[1] );

            // Coerce values.
            if ( coerce ) {
              val = val && !isNaN(val)            ? +val              // number
                : val === 'undefined'             ? undefined         // undefined
                : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                : val;                                                // string
            }

            if ( keys_last ) {
              // Complex key, build deep object structure based on a few rules:
              // * The 'cur' pointer starts at the object top-level.
              // * [] = array push (n is set to array length), [n] = array if n is
              //   numeric, otherwise object.
              // * If at the last keys part, set the value.
              // * For each keys part, if the current level is undefined create an
              //   object or array based on the type of the next keys part.
              // * Move the 'cur' pointer to the next level.
              // * Rinse & repeat.
              for ( ; i <= keys_last; i++ ) {
                key = keys[i] === '' ? cur.length : keys[i];
                cur = cur[key] = i < keys_last
                  ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
                  : val;
              }

            } else {
              // Simple key, even simpler rules, since only scalars and shallow
              // arrays are allowed.

              if ( $.isArray( obj[key] ) ) {
                // val is already an array, so push on the next value.
                obj[key].push( val );

              } else if ( obj[key] !== undefined ) {
                // val isn't an array, but since a second value has been specified,
                // convert val into an array.
                obj[key] = [ obj[key], val ];

              } else {
                // val is a scalar.
                obj[key] = val;
              }
            }

          } else if ( key ) {
            // No value was defined, so set something meaningful.
            obj[key] = coerce
              ? undefined
              : '';
          }
        });

        return obj;
      },

    mergeOntoHashQueryString: function(objToSerialize) {
        var currentHashQryStr = this.getHashQueryString(),
            newHashParams = {},
            hashParams;

        // if current hash has no local query string, we're safe to append
        if(currentHashQryStr.length === 0) {
            newHashParams = jQuery.param( objToSerialize );
        }
        else {
            // if current hash *does* have a query string, de-serialize it
            hashParams = this.deparam(currentHashQryStr);
            newHashParams = jQuery.param($.extend({}, hashParams, objToSerialize));
        }
        
        this.setHashQueryString(newHashParams);
    }
};

ko['bindingHandlers']['hashClick'] = {

    'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var bindingData = valueAccessor();
        if(bindingData['watch'])
        {
            var val = bindingData['watch'](); // sets up a dependency on this observable
        }
        ko.utils.registerEventHandler(element, "click", function (event) {
            mediator.handleEvent(bindingData['value'], bindingData, viewModel)
        })
    },

    'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var bindingData = valueAccessor();
        if(mediator.updateReady[bindingData['member']]) {
            mediator.handleEvent(ko.utils.unwrapObservable(viewModel[bindingData['member']]), bindingData, viewModel);
        }
        else {
            mediator.updateReady[bindingData['member']] = true;
        }
    }
}
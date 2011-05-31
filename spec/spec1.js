QUnit.specify("hashClick", function(){
    describe("hashClickHelpers", function(){
        describe("No hash set", function(){
            var emptyObj = {};

            before(function(){
                hashClickHelpers.setHashQueryString("");
            });

            it("should return an empty hash if no hash has been added", function(){
                assert(hashClickHelpers.getHash()).equals('');
            });

            it("should return an empty hash query string if none exists", function(){
                assert(hashClickHelpers.getHashQueryString()).equals('');
            });

            it('should return an empty params object if no query string exists', function(){
                assert(hashClickHelpers.getHashParamsAsObject()).isSameAs(emptyObj,"Empty Object");
            });

            it('should return an empty params object if no query string exists and deparam is called', function(){
                assert(hashClickHelpers.deparam("")).isSameAs(emptyObj,"Empty Object");
            });
        });

        describe("Hash set manually", function(){
            var testQryStr = "a=1&b=2&c=text";
            before(function(){
                hashClickHelpers.setHashQueryString(testQryStr);
            });

            it('should have a hash value matching the expected string value', function(){
                assert(hashClickHelpers.getHash()).equals("?a=1&b=2&c=text");
            });

            it('should have a non-empty hash query string', function(){
                assert(hashClickHelpers.getHashQueryString()).isDefined("Hash query string is defined.");
            });

            it('should have set the hash query string to the specified value', function(){
                assert(hashClickHelpers.getHashQueryString()).equals(testQryStr);
            });
        });

        describe("Hash set via serialization", function(){
            var testQryStrObj = { a: 1, b: 2, c: 'text' },
                deserializedObj,
                deParamObj;
            before(function(){
                hashClickHelpers.setHashQueryString("");
                hashClickHelpers.mergeOntoHashQueryString(testQryStrObj);
                deserializedObj = hashClickHelpers.getHashParamsAsObject();
                deParamObj = hashClickHelpers.deparam(hashClickHelpers.getHashQueryString(), true);
            });

            it('should have a hash value matching the expected string value', function(){
                assert(hashClickHelpers.getHash()).equals("?a=1&b=2&c=text");
            });

            it('should return a defined params object', function(){
                assert(deserializedObj).isDefined("Hash query string object is defined.");
            });

            it('should return a params object with expected values', function(){
                assert(deserializedObj).isSameAs(testQryStrObj);
            });

            it('should return a defined params object when calling deparam directly', function(){
                assert(deParamObj).isDefined("Hash query string object is defined.");
            });

            it('should return a params object with expected values when calling deparam directly', function(){
                assert(deParamObj).isSameAs(testQryStrObj);
            });
        });

        describe("Merging Values Onto Hash", function(){
            var originalHashObj = { a: 1, b: 2, c: 'text' },
                hashObjToMerge = { b:24, d: 'helloworld' },
                mergedObject = { a:1, b:24,c:"text", d:"helloworld" },
                deserializedObj,
                deParamObj;

            before(function(){
                hashClickHelpers.setHashQueryString("");
                hashClickHelpers.mergeOntoHashQueryString(originalHashObj);
                hashClickHelpers.mergeOntoHashQueryString(hashObjToMerge);
                deserializedObj = hashClickHelpers.getHashParamsAsObject();
                deParamObj = hashClickHelpers.deparam(hashClickHelpers.getHashQueryString(), true);
            });

            it('should have a hash value matching the expected string value', function(){
                assert(hashClickHelpers.getHash()).equals("?a=1&b=24&c=text&d=helloworld");
            });

            it('should return a defined params object', function(){
                assert(deserializedObj).isDefined("Hash query string object is defined.");
            });

            it('should return a params object with expected values', function(){
                assert(deserializedObj).isSameAs(mergedObject);
            });

            it('should return a defined params object when calling deparam directly', function(){
                assert(deParamObj).isDefined("Hash query string object is defined.");
            });

            it('should return a params object with expected values when calling deparam directly', function(){
                assert(deParamObj).isSameAs(mergedObject);
            });

        });
    });

    describe("HashClickMediator", function(){

        before(function(){
            hashClickHelpers.setHashQueryString("");
        });

        describe("Initialization", function(){
            it('should initialize the priorHashParams to empty object', function(){
                assert(mediator.priorHashParams).isSameAs({}, "Empty Object");
            });

            it('should initialize the mappings to an empty object', function(){
                assert(mediator.mappings).isSameAs({}, "Empty Object");
            });

            it('should initialize readyToUpdate to false', function(){
               assert(mediator.readyToUpdate).equals(false);
            });
        });

        describe("Updating hash", function(){
            window.modelObj = {
                    username: ko.observable("bugs bunny"),
                    newField: ko.observable("")
                };
            var expectedQtyStr = "a=Wyle+E.+Coyote";
            before(function(){
                mediator.handleEvent('Wyle E. Coyote', { member: 'username', watch: window.modelObj.username, substitute: 'a', value: 'Wyle E. Coyote' }, window.modelObj);
            });

            it('should have set the hash query string with new username', function(){
                assert(hashClickHelpers.getHashQueryString()).equals(expectedQtyStr);
            });
        });
    });
});

window.modelObj.username.subscribe(function() {

    QUnit.specify("hashClick", function(){

        describe("HashClickMediator", function(){
            describe("Hash updating model", function(){
                it('should have one mapping record', function(){
                    assert(mediator.mappings.a).isDefined("Mapping with substitute of 'a' is defined");
                })
                it('should update the model from the hash query string', function(){
                    assert(window.modelObj.username()).equals('Wyle E. Coyote');
                });
            });
        });

        describe("Pre-Knockoutjs Initialization", function(){
            before(function(){
                var span = document.createElement("span");
                span.id = "testSpan";
                span.setAttribute("data-bind", "hashClick: {member: 'username', watch: username, substitute: 'a', value: 'Wyle E. Coyote' }");
                document.body.appendChild(span);

                var spanB = document.createElement("span");
                spanB.id = "testSpanB";
                spanB.setAttribute("data-bind", "hashClick: {member: 'newField', watch: newField, substitute: 'b', value: 'Road Runner' }");
                document.body.appendChild(spanB);
            });
            it('should show no click events bound to the test span element', function(){
                assert($("#testSpan").data("events")).isUndefined();
            });
        });

        describe("Knockout Initialization", function(){
            before(function(){
                ko.applyBindings(window.modelObj);
            });

            it('should set mediator.readyToUpdate to true', function(){
                assert(mediator.readyToUpdate).equals(true);
            });
            it('should show at least one click event bound to the test span element', function(){
                assert($("#testSpan").data("events")['click'].length >= 1).equals(true);
            });
        });

        describe("Updating Hash With Second Param", function(){
            var expectedQtyStr = "a=Wyle+E.+Coyote&b=Road+Runner";
            before(function(){
                mediator.handleEvent('Road Runner', { member: 'newField', watch: window.modelObj.newField, substitute: 'b', value: 'Road Runner' }, window.modelObj);
            });

            it('should have updated the hash with the new value (Road Runner)', function(){
                var qryStr = hashClickHelpers.getHashQueryString();
                assert(qryStr).equals(expectedQtyStr);
            });

            after(function(){
                setTimeout(function(){
                    window.modelObj.newField("Yosemite Sam");
                },0);

            });
        });
    });
});

window.modelObj.newField.subscribe(function(){
    if(window.modelObj.newField() === "Yosemite Sam"){
        var addEventListener = function (element, eventType, handlerFn){
            if(element.addEventListener){
                element.addEventListener(eventType, handlerFn, false);
            }else if(element.attachEvent){
                element.attachEvent('on' + eventType, handlerFn);
            }
        };

        addEventListener(window, "hashchange", function(){
            QUnit.specify("hashClick", function(){
                describe("Indirect Model Updates", function(){
                    var expectedRes = "a=Wyle+E.+Coyote&b=Yosemite+Sam";
                    it('should have updated the hash with the new value from model (Yosemite Sam)', function(){
                        assert(hashClickHelpers.getHashQueryString()).equals(expectedRes);
                    });
                });
            });
        });
    };
});



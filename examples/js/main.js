var vm = {
    username: ko.observable("Bugs Bunny"),
    otherUsername: ko.observable("Road Runner")
}

$(function() {
    ko.applyBindings(vm);
});
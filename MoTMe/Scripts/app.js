﻿var app = angular.module('MoTMe', []).run([
   "$rootScope", "$http",
  function ($rootScope, $http) {
      //nothing to run first yet
  }
]);

app.controller('PhoneCtrl', ["$scope", "$http", "$rootScope", function ($scope, $http, $rootScope) {
    $scope.number = "";
    $scope.message = "";
    $scope.isValidated = false;
    var code = GetRandomCode();

    function CheckIfIsAPhoneNumber() {
        $scope.number = angular.element('#PhoneNumber').val();
        console.log($scope.number);
        if ( !isNaN($scope.number) && $scope.number.length > 9 && $scope.number.length < 16) {
            return true;
        } else {
            return false;
        }
    }

    $scope.SendCode = function () {
        code = GetRandomCode();
        if (CheckIfIsAPhoneNumber()) {
            $http({
                url: "/Home/SendSMS/",
                method: "POST",
                data: {
                    number: $scope.number,
                    content: code
                }
            }).success(function () {
                console.log("request sent");
            });
        } else {
            $scope.message = "Not a valid phone number";
        }
    }

    function GetRandomCode()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 10; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    $scope.CheckIfMatchesCode = function () {
        if ($scope.userCode === code) {
            $scope.isValidated = true;
        } else {
            $scope.message = "Code was not correct. Please try again.";
        }
    }
}]);

app.controller('RootCtrl', ["$scope", "$http", "$rootScope", function ($scope, $http, $rootScope) {
    $http.get("/Manage/GetUserObjectJSON")
        .success(function (data) {
            $scope.user = data;
            //console.log($scope.user);
        })
        .error(function (error) { console.log(error.error) });
}]);

app.controller('IndexCtrl', ["$scope", "$http", "$rootScope", function ($scope, $http, $rootScope) {
    $scope.body = "";
    $scope.sms = false
    $scope.postSendMessage = "";
    var numberOfViewableMessages = 50;

    var changed = false;
    $scope.$watch('user', function (newValue, oldValue) {
        //this will prevent the initial running of $watch
        if (changed == false) {
            changed = true;
        } else {
//----------EVERYTHING IN HERE WILL RUN ONCE THE USER OBJECT IS DEFINED------------
            console.log(newValue, oldValue);

            //Getting contacts
            $http({
                url: "/Manage/GetContactUsersByUserId/",
                method: "GET",
                params: {
                    uid: $scope.user.Id
                }
            })
                .success(function (data) {
                    console.log(data);
                    $scope.contacts = data;
                    console.log($scope.contacts);
                })
                .error(function (error) { console.log(error.error) });
        }
    });

    

    //set which contact the user has clicked on
    $scope.setClickedContact = function (contact) {
        $scope.clickedContact = contact;
        console.log($scope.clickedContact);
        $scope.RefreshMessages();
        //window.scrollTo(0, document.body.scrollHeight);
    };
    
    //refresh the dom with new messages
    $scope.RefreshMessages = function () {
        //if clickedContact is undefined, this will cut of the method before $http
        $scope.clickedContact.Id = $scope.clickedContact.Id;
        //Get a specific number of the latest messgaes between
        //the user and this certain contact
        $http({
            url: "/Manage/GetMessagesForOneContact_CertainNumber/",
            method: "GET",
            params: {
                aid: $scope.user.Id,
                rid: $scope.clickedContact.Id,
                number: numberOfViewableMessages
            }
        })
        .success(function (data) {
            $scope.messages = ChangeDate(data);
            //console.log($scope.messages);
        })
        .error(function (error) { console.log(error.error) });
    };

    //add a message to the database
    $scope.AddMessage = function (message) {
        console.log($scope.clickedContact.Id);
        if (message != "" && message != null && message != undefined) {
            $http({
                url: "/Manage/AddMessage",
                method: "POST",
                data: {
                    body: message,
                    authorId: $scope.user.Id,
                    recieverId: $scope.clickedContact.Id
                }
            }).success(function () {
                //refresh database after message is added
                $scope.RefreshMessages();
                //set the input field to null again
                $scope.body = "";
            });
        }
        $scope.RefreshMessages();
    };

    $scope.ChangeSMS = function () {
        if ($scope.sms) {
            $scope.sms = false;
        } else {
            $scope.sms = true;
        }
    }

    $scope.SendSMS = function (message) {
        $scope.postSendMessage = "Sending . . .";
        message = "A MoTMe message from " + $scope.user.Name + ":    " + message;
        if (message.length < 160) {
            $http({
                url: "/Manage/SendSMS",
                method: "POST",
                data: {
                    number: $scope.clickedContact.Phone,
                    content: message
                }
            }).success(function () {
                console.log("request sent");
                $scope.postSendMessage = "Message sent!";
            });
        } else {
            $scope.postSendMessage = "Message is to long. Please shorten it.";
        }
    }

    //convert the json date to a javascript date
    function ChangeDate(messageArr) {
        for (var i = 0; i < messageArr.length; i++) {
            messageArr[i].Date = new Date(parseInt(messageArr[i].Date.replace('/Date(', ''))).toString();
            messageArr[i].Date = messageArr[i].Date.replace(' GMT-0600 (Central Standard Time)', '');
        }
        return messageArr;
    }

//////This code will run every second
//////updates dom with the latest version of messages every second
    $(function () {
        setInterval(oneSecondFunction, 1000);
    });
    function oneSecondFunction() {
        //things to do every second
        if ($scope.clickedContact != undefined) {
            $scope.RefreshMessages();
        }
    }
}]);

app.controller('ContactCtrl', ["$scope", "$http", "$rootScope", function ($scope, $http, $rootScope) {
    var changed = false;
    $scope.$watch('user', function (newValue, oldValue) {
        //this will prevent the initial running of $watch
        if (changed == false) {
            changed = true;
        } else {
            //----------EVERYTHING IN HERE WILL RUN ONCE THE USER OBJECT IS DEFINED------------
            console.log(newValue, oldValue);

            //Getting users that are not already contacts
            $http({
                url: "/Manage/GetUsersThatAreNotContacts/",
                method: "GET",
                params: {
                    uid: $scope.user.Id
                }
            })
                .success(function (data) {
                    console.log(data);
                    $scope.users = data;
                    console.log($scope.users);
                })
                .error(function (error) { console.log(error.error) });
        }
    });

    $scope.AddToContacts = function (userId, otherUserId, index) {
        console.log(userId, otherUserId, index);
        $http({
            url: "/Manage/AddContact",
            method: "POST",
            data: {
                userId: userId,
                contactId: otherUserId
            }
        }).success(function () {
            console.log("request sent");
            $scope.users.splice(index, 1);
        });
    };
}]);

app.controller('AlertCtrl', ["$scope", "$http", "$rootScope", function ($scope, $http, $rootScope) {
    //To be filled in
}]);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});
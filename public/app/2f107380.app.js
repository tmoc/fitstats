"use strict";angular.module("fitStatsApp",["ui.bootstrap","nvd3ChartDirectives","ngCookies","ngResource","ngSanitize","ui.bootstrap","ui.router","googlechart"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.when("/dashboard","/dashboard/today").otherwise("/"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$stateChangeStart",function(a,d){d.authenticate&&!c.isLoggedIn()&&b.path("/login")})}]),angular.module("fitStatsApp").config(["$stateProvider",function(a){a.state("login",{url:"/login",templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).state("signup",{url:"/signup",templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).state("settings",{url:"/settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]),angular.module("fitStatsApp").controller("LoginCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/dashboard")}).catch(function(b){a.errors.other=b.message})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("fitStatsApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."}).catch(function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password",a.message=""})}}]),angular.module("fitStatsApp").controller("SignupCtrl",["$scope","Auth","$location",function(a,b,c){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password,mfpId:a.user.mfpId}).then(function(){c.path("/dashboard")}).catch(function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})}}]),angular.module("fitStatsApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){b.get("/api/users").success(function(b){a.users=b}),a.delete=function(b){d.remove({id:b._id}),angular.forEach(a.users,function(c,d){c===b&&a.users.splice(d,1)})}}]),angular.module("fitStatsApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("fitStatsApp").controller("DashboardCtrl",["$scope","$filter","DashboardFactory","$stateParams","$state","$http","$timeout",function(a,b,c,d,e,f,g){a.currentDay={},a.formData={},a.currentDayRawClone={},a.inputModes={},a.loadViewItem=function(c,d){a.currentDayRawClone[d]=c,a.formData[d]=c;var e="weight"===d||"bf"===d?1:0;a.currentDay[d]=b("number")(c,e),"bps"===d||"bpd"===d?a.inputModes.bp=!1:"calories"===d||"protein"===d||"cabs"===d||"fat"===d?(a.inputModes.nutrition=!1,a.chartUpdate()):a.inputModes[d]=!1},a.retrieveWholeDaysStats=function(){c.retrieveDayStats().get({date:a.urlDate}).$promise.then(function(b){a.formData=b.data||{},_.forEach(a.formData,function(b,c){a.loadViewItem(b,c)})},function(){console.log("GET request fail for day: "+a.urlDate)})},a.findCurrentDate=function(){if("today"===d.date)a.mainTitle="Today",a.date=new Date,c.rawDate=a.date,a.urlDate=b("date")(c.rawDate,"yyyyMMdd"),a.retrieveWholeDaysStats();else if(c.rawDate instanceof Date){var f=b("date")(new Date,"yyyyMMdd"),g=b("date")(c.rawDate,"yyyyMMdd");a.mainTitle=f===g?"Today":"Date",a.date=c.rawDate,a.urlDate=d.date,a.retrieveWholeDaysStats()}else if(isNaN(Number(d.date)%1))e.go("dashboard",{date:"today"});else{var h=new Date,i=b("date")(h,"yyyyMMdd"),j=d.date;if(i===j)a.mainTitle="Today",a.date=h,c.rawDate=a.date,a.urlDate=j,a.retrieveWholeDaysStats();else{var k=j.slice(0,4),l=j.slice(4,6)-1,m=j.slice(6);a.mainTitle="Date",a.date=new Date(k,l,m),c.rawDate=a.date,a.urlDate=j,a.retrieveWholeDaysStats()}}},a.findCurrentDate(),a.nextDay=function(){c.rawDate.setDate(c.rawDate.getDate()+1);var a=b("date")(c.rawDate,"yyyyMMdd");e.go("dashboard",{date:a})},a.previousDay=function(){c.rawDate.setDate(c.rawDate.getDate()-1);var a=b("date")(c.rawDate,"yyyyMMdd");e.go("dashboard",{date:a})},a.resetDate=function(){e.go("dashboard",{date:"today"})},a.edit=function(b){a.inputModes[b]=!0},a.submit=function(b,d){c.submitFieldValue(b,d,a.loadViewItem,a.urlDate),a.inputModes[d]=!1},a.getMfpData=function(){var b;b="string"==typeof c.mfpId.data?c.mfpId.data:window.prompt("What is is your MFP user ID?"),f.get("/api/mfp/"+b+"/"+a.urlDate).success(function(b){b.data.private?window.alert("This profile is private"):b.data.calories||b.data.protein||b.data.carbs||b.data.fat?(b.data.calories=4*Number(b.data.protein)+4*Number(b.data.carbs)+9*Number(b.data.fat)||void 0,c.submitMultipleFields(b.data,a.loadViewItem,a.urlDate)):window.alert("No data for this day")})},a.chartUpdate=function(){a.macroNutrientData=[{key:"Protein",y:a.formData.protein},{key:"Carbs",y:a.formData.carbs},{key:"Fat",y:a.formData.fat}];var b=["#61ce5c","#59c2e6","#d57272"];a.colorFunction=function(){return function(a,c){return b[c]}},a.xFunction=function(){return function(a){return a.key}},a.yFunction=function(){return function(a){return a.y}},a.descriptionFunction=function(){return function(a){return a.key}}},g(function(){a.chartUpdate()},500)}]).controller("WeightController",["$scope",function(a){a.inputModes.weight=a.currentDay.weight?!1:!0}]).controller("BFController",["$scope",function(a){a.inputModes.bf=a.currentDay.bf?!1:!0}]).controller("HRController",["$scope",function(a){a.inputModes.hr=a.currentDay.hr?!1:!0}]).controller("BPController",["$scope","DashboardFactory",function(a,b){a.inputModes.bp=a.currentDay.bps||a.currentDay.bpd?!1:!0,a.submitBoth=function(){a.inputModes.bp=!1,b.submitMultipleFields({bps:a.formData.bps,bpd:a.formData.bpd},a.loadViewItem,a.urlDate)}}]).controller("FoodController",["$scope","$timeout","DashboardFactory",function(a,b,c){a.inputModes.nutrition=a.currentDay.calories||a.currentDay.protein||a.currentDay.carbs||a.currentDay.fat?!1:!0,a.submitAll=function(){a.inputModes.nutrition=!1,a.formData.calories===a.currentDayRawClone.calories||a.formData.protein!==a.currentDayRawClone.protein&&a.formData.carbs!==a.currentDayRawClone.carbs&&a.formData.fat!==a.currentDayRawClone.fat?a.formData.calories=4*Number(a.formData.protein)+4*Number(a.formData.carbs)+9*Number(a.formData.fat):(a.formData.protein=0,a.formData.carbs=0,a.formData.fat=0),c.submitMultipleFields({calories:a.formData.calories,protein:a.formData.protein,carbs:a.formData.carbs,fat:a.formData.fat},a.loadViewItem,a.urlDate)}}]),angular.module("fitStatsApp").config(["$stateProvider",function(a){a.state("dashboard",{url:"/dashboard/:date",templateUrl:"app/dashboard/dashboard.html",controller:"DashboardCtrl",authenticate:!0})}]),angular.module("fitStatsApp").factory("DashboardFactory",["$filter","$resource","User","$http",function(a,b,c){var d=function(){return b("/api/fitnessData/:date",{date:"@date"})},e=function(a,c,d,e){var f=b("/api/fitnessData/:date/:field",{date:"@date",field:"@field"},{update:{method:"PUT",isArray:!1}}),g=new f;g.date=e,g.field=c,g.data=a,g.$update({},function(a){d(a.data.data,a.data.field)})},f=function(a,c,d){var e=b("/api/fitnessData/:date/:field",{date:"@date",field:"@field"},{update:{method:"PUT",isArray:!1}}),f=new e;f.date=d,f.field="multifields",f.data=a,f.$update({},function(a){for(var b in a.data.data)c(a.data.data[b],b)})};return{mfpId:c.getMFP(),rawDate:void 0,retrieveDayStats:d,submitFieldValue:e,submitMultipleFields:f}}]),angular.module("fitStatsApp").controller("MainCtrl",["$scope",function(a){a.weightLossChart={type:"LineChart",displayed:!0,data:{cols:[{id:"month",label:"Month",type:"string",p:{}},{id:"weight-id",label:"Weight",type:"number",p:{}}],rows:[{c:[{v:"7-13"},{v:175,f:"175.0 lbs"}]},{c:[{v:"7-14"},{v:175.2,f:"175.2 lbs"}]},{c:[{v:"7-15"},{v:174.6,f:"174.6 lbs"}]},{c:[{v:"7-16"},{v:174.2,f:"174.2 lbs"}]},{c:[{v:"7-17"},{v:174.6,f:"174.6 lbs"}]},{c:[{v:"7-18"},{v:173.8,f:"173.8 lbs"}]}]},options:{title:"Weight Loss Over Time",isStacked:"true",fill:20,displayExactValues:!0,vAxis:{gridlines:{count:10}},hAxis:{}},formatters:{},view:{}}}]),angular.module("fitStatsApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("fitStatsApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){e.put("token",a.token),d.get().$promise.then(function(b){return g=b,i.resolve(a),h()})}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return e.get("token")},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("fitStatsApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}},getMFP:{method:"GET",params:{id:"mfpId"}}})}]),angular.module("fitStatsApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("fitStatsApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.login=function(){c.login(),b.path("/dashboard")},a.logout=function(){c.logout(),b.path("/")},a.isActive=function(a){return"/dashboard"===a&&-1!==b.path().indexOf("/dashboard")?"/dashboard":a===b.path()}}]),angular.module("fitStatsApp").run(["$templateCache",function(a){a.put("app/account/login/login.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class="col-xs-12 col-xs-offset-0"><form class=form-account-auth name=form role=form ng-submit=login(form) novalidate><h2 class=form-account-auth-heading>Log In</h2><div class=oauth-buttons style="display: block; text-align: center"><a class="btn btn-lg btn-fitbit" ng-click="loginOauth(\'facebook\')"><img src=/assets/images/b163f904.icon-fitbit.png>Login with Fitbit</a> <a class="btn btn-lg btn-facebook" ng-click="loginOauth(\'facebook\')"><i class="fa fa-facebook"></i>Login with Facebook</a></div><p class=separator>or</p><input type=email name=email class=form-control placeholder="Email address" required autofocus ng-model=user.email> <input type=password name=password class=form-control placeholder=Password required ng-model=user.password><div class="form-group has-error"><p class=help-block ng-show="form.email.$error.required && form.password.$error.required && submitted">Please enter your email and password.</p><p class=help-block>{{ errors.other }}</p></div><button class="btn btn-lg btn-primary btn-block" type=submit>Log In</button> <a class=register href=/signup>Don\'t Have an Account?</a><p>Accounts are reset on server restart from <code>server/config/seed.js</code>.</p><p>Default account is <code>test@test.com</code> / <code>test</code></p><p>Admin account is <code>admin@admin.com</code> / <code>admin</code></p></form></div></div></div><div ng-include="\'components/footer/footer.html\'"></div>'),a.put("app/account/settings/settings.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class="btn btn-lg btn-primary" type=submit>Save changes</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class="col-xs-12 col-xs-offset-0"><form class=form-account-auth name=form role=form ng-submit=register(form) novalidate><h2 class=form-account-auth-heading>Sign Up</h2><div class=oauth-buttons style="display: block; text-align: center"><a class="btn btn-lg btn-fitbit" ng-click="registerOauth(\'fitbit\')"><img src=/assets/images/b163f904.icon-fitbit.png>Register with Fitbit</a> <a class="btn btn-lg btn-facebook" ng-click="registerOauth(\'facebook\')"><i class="fa fa-facebook"></i>Register with Facebook</a></div><p class=separator>or</p><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><input name=name class=form-control placeholder=Name ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">A name is required</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><input type=email name=email class=form-control placeholder="Email address" ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">Doesn\'t look like a valid email.</p><p class=help-block ng-show="form.email.$error.required && submitted">What\'s your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><input type=password name=password class=form-control placeholder=Password ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div class=form-group ng-class="{ \'has-success\': form.mfp.$valid && submitted,\n                                            \'has-error\': form.mfp.$invalid && submitted }"><input type=mfp name=mfp class=form-control placeholder="MyFitnessPal ID" ng-model=user.mfpId mongoose-error><p class=help-block ng-show="form.mfp.$error.email && submitted">Oops looks like your MFP profile is set to private. <a href="">Click here</a> for instructions.</p></div><button class="btn btn-lg btn-success btn-block" type=submit>Sign Up</button></form></div></div></div><div ng-include="\'components/footer/footer.html\'"></div><!-- <div ng-include="\'components/navbar/navbar.html\'"></div>\n\n<div class="container">\n  <div class="row">\n    <div class="col-sm-12">\n      <h1>Sign up</h1>\n    </div>\n    <div class="col-sm-12">\n      <form class="form" name="form" ng-submit="register(form)" novalidate>\n\n        <div class="form-group" ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }">\n          <label>Name</label>\n\n          <input type="text" name="name" class="form-control" ng-model="user.name"\n                 required/>\n          <p class="help-block" ng-show="form.name.$error.required && submitted">\n            A name is required\n          </p>\n        </div>\n\n        <div class="form-group" ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }">\n          <label>Email</label>\n\n          <input type="email" name="email" class="form-control" ng-model="user.email"\n                 required\n                 mongoose-error/>\n          <p class="help-block" ng-show="form.email.$error.email && submitted">\n            Doesn\'t look like a valid email.\n          </p>\n          <p class="help-block" ng-show="form.email.$error.required && submitted">\n            What\'s your email address?\n          </p>\n          <p class="help-block" ng-show="form.email.$error.mongoose">\n            {{ errors.email }}\n          </p>\n        </div>\n\n        <div class="form-group" ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }">\n          <label>Password</label>\n\n          <input type="password" name="password" class="form-control" ng-model="user.password"\n                 ng-minlength="3"\n                 required\n                 mongoose-error/>\n          <p class="help-block"\n             ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">\n            Password must be at least 3 characters.\n          </p>\n          <p class="help-block" ng-show="form.password.$error.mongoose">\n            {{ errors.password }}\n          </p>\n        </div>\n\n        <div>\n          <button class="btn btn-inverse btn-lg btn-login" type="submit">\n            Sign up\n          </button>\n          <a class="btn btn-default btn-lg btn-register" href="/login">\n            Login\n          </a>\n        </div>\n      </form>\n    </div>\n  </div>\n</div> -->'),a.put("app/admin/admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li class=list-group-item ng-repeat="user in users"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'),a.put("app/dashboard/dashboard.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div><div class=container><!-- Day Selector --><div class="row day-select"><div class="col-md-offset-3 col-md-6"><!-- <button><i class="fa fa-chevron-left" ng-click="previousDay()"></i></button> --><button class=date-button><i class="fa fa-chevron-left" ng-click=previousDay()></i></button> <button class=date-button ng-click=resetDate()><h2>{{ mainTitle }}</h2></button> <!-- <h4>July 8, 2014</h4> --><h4>{{ date | date: \'EEE MMMM d, yyyy\' }}</h4><!-- <button><i class="fa fa-chevron-right" ng-click="nextDay()"></i> </button> --><button class=date-button><i class="fa fa-chevron-right" ng-click=nextDay()></i></button></div></div><!-- end day selector --><div class=row><!-- First Column --><div class=col-md-4><!-- Weight Block --><div class="panel panel-default weight"><div class=panel-heading>WEIGHT</div><div class=panel-body><!-- weight form --><form role=form ng-controller=WeightController ng-submit="submit(formData.weight, &quot;weight&quot;)"><label for=weight>Weight:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.weight><span class=display>{{ currentDay.weight }}<span class=suffix>lbs</span></span></div><div class=input ng-if=inputModes.weight><input type=number class=form-control id=weight placeholder="Weight in lbs" ng-model=formData.weight></div></div><div class=controls><button type=submit ng-if="inputModes.weight && formData.weight"><i class="fa fa-floppy-o"></i></button> <button><i class="fa fa-pencil edit" ng-if=!inputModes.weight ng-click="edit(\'weight\')"></i></button></div></form><!-- end weight form --><!-- body fat form --><form role=form ng-controller=BFController ng-submit="submit(formData.bf, &quot;bf&quot;)"><label for=bf>Body Fat:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.bf><span class=display>{{ currentDay.bf }}<span class=suffix>%</span></span></div><div class=input ng-if=inputModes.bf><input type=number class=form-control id=bf placeholder="Body Fat as %" ng-model=formData.bf></div></div><div class=controls><button type=submit ng-if="inputModes.bf && formData.bf"><i class="fa fa-floppy-o"></i></button> <button><i class="fa fa-pencil edit" ng-if=!inputModes.bf ng-click="edit(\'bf\')"></i></button></div></form><!-- end body fat form --></div></div><!-- end weight block --><!-- Heart Block --><div class="panel panel-default heart"><div class=panel-heading>HEART</div><div class=panel-body><!-- heart rate form --><form role=form ng-controller=HRController ng-submit="submit(formData.hr, &quot;hr&quot;)"><label for=hr>Resting HR:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.hr><span class=display>{{ currentDay.hr }}<span class=suffix>bpm</span></span></div><div class=input ng-if=inputModes.hr><input type=number class=form-control id=hr placeholder="Heart Rate in BPM" ng-model=formData.hr></div></div><div class=controls><button type=submit ng-if="inputModes.hr && formData.hr"><i class="fa fa-floppy-o"></i></button> <button><i class="fa fa-pencil edit" ng-if=!inputModes.hr ng-click="edit(\'hr\')"></i></button></div></form><!-- end heart rate form\n\n              <!-- blood pressure form --><form role=form ng-controller=BPController ng-submit=submitBoth()><label for=bps>BP:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.bp><span class=display>{{ currentDay.bps }} / {{ currentDay.bpd }}<span class=suffix>mmHg</span></span></div><div class=input ng-if=inputModes.bp><input type=number class=form-control id=bps placeholder=Systolic ng-model=formData.bps> <input type=number class=form-control id=bpd placeholder=Diastolic ng-model=formData.bpd></div></div><div class=controls><button type=submit ng-if="inputModes.bp && formData.bps && formData.bpd"><i class="fa fa-floppy-o"></i></button> <button><i class="fa fa-pencil edit" ng-if=!inputModes.bp ng-click="edit(\'bp\')"></i></button></div></form><!-- end blood pressure form --></div></div><!-- end heart block --></div><!-- end first column --><!-- Second Column --><div class=col-md-4><!-- Food Block --><div class="panel panel-default food" ng-controller=FoodController><div class=panel-heading>FOOD <button class=mfp-button ng-click=getMfpData()>Pull from MFP <i class="fa fa-cloud-download"></i></button></div><div class=panel-body><!-- Food form --><form name=foodForm role=form ng-submit=submitAll()><label for=calories>Calories:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.nutrition><span class=display>{{ currentDay.calories }}<span class=suffix>kcal</span></span></div><div class=input ng-if=inputModes.nutrition><input name=calories type=number class=form-control id=calories placeholder=Calories ng-model=formData.calories ng-show="(foodForm.protein.$pristine && foodForm.carbs.$pristine && foodForm.fat.$pristine)\n                    || (!formData.protein && !formData.carbs && !formData.fat)"></div></div><label for=protein>Protein:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.nutrition><span class=display>{{ currentDay.protein }}<span class=suffix>g</span></span></div><div class=input ng-if=inputModes.nutrition><input name=protein type=number class=form-control id=protein placeholder="Protein in grams" ng-model=formData.protein ng-change=chartUpdate() ng-show="foodForm.calories.$pristine || !formData.calories"></div></div><label for=carbs>Carbs:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.nutrition><span class=display>{{ currentDay.carbs }}<span class=suffix>g</span></span></div><div class=input ng-if=inputModes.nutrition><input name=carbs type=number class=form-control id=carbs placeholder="Carbs in grams" ng-model=formData.carbs ng-change=chartUpdate() ng-show="foodForm.calories.$pristine || !formData.calories"></div></div><label for=fat>Fat:</label><div class=data-display-and-input><div class=display ng-if=!inputModes.nutrition><span class=display>{{ currentDay.fat }}<span class=suffix>g</span></span></div><div class=input ng-if=inputModes.nutrition><input name=fat type=number class=form-control id=fat placeholder="Fat in grams" ng-model=formData.fat ng-change=chartUpdate() ng-show="foodForm.calories.$pristine || !formData.calories"></div></div><div class=controls><button type=submit ng-if="inputModes.nutrition && formData.calories && formData.protein && formData.carbs && formData.fat"><i class="fa fa-floppy-o"></i></button> <button><i class="fa fa-pencil edit" ng-if=!inputModes.nutrition ng-click="edit(\'nutrition\')"></i></button></div></form><!-- end food form --><div style="margin: 0 auto 0"><nvd3-pie-chart data=macroNutrientData id=macroNutrient height=300 margin={left:0,top:15,bottom:0,right:0} x=xFunction() y=yFunction() showlabels=true color=colorFunction() nodata="No data to populate"><svg height=300></svg></nvd3-pie-chart></div></div></div><!-- end food block --></div><!-- end second column\n\n      <!-- Third Column --><div class=col-md-4><div class="panel panel-default exercise"><div class=panel-heading>EXERCISE</div><div class=panel-body>Coming Soon</div></div><div class="panel panel-default water"><div class=panel-heading>WATER</div><div class=panel-body>Coming Soon</div></div></div><!-- end third column --></div><!-- end row --></div><!-- end container --></div><!--  --><!-- footer start  --><div ng-include="\'components/footer/footer.html\'"></div><!-- <div class="footer">\n  <div class="container">\n    <p class="text-muted">&copy; 2014 FitStats</p>\n  </div>\n</div> -->'),a.put("app/main/main.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><header class=hero-unit><div class=container><div class=row><div class="col-md-6 hero-text"><h1>Unify your Fit Life</h1><p class=lead>Finally, a single place to collect, view, and analyze your fitness data from apps you already use.</p><div class=buttons><button class="btn btn-lg btn-fitbit"><img src=/assets/images/b163f904.icon-fitbit.png>Register with Fitbit</button> <button class="btn btn-lg btn-facebook"><i class="fa fa-facebook"></i>Register with Facebook</button></div><p class=faded><a href=/signup>Create a Free Account Using Email</a></p></div><div class=col-md-6><div class=hero-chart><div google-chart chart=weightLossChart style="height: 275px; width: 100%"></div></div></div></div></div></header><div class="container sub-section"><div class=row><div class="col-md-6 features"><h2>Features:</h2><ul><li><i class="fa fa-user"></i>Weight and Body Fat % Tracking</li><li><i class="fa fa-heart"></i>Heart Rate and Blood Pressure Tracking</li><li><i class="fa fa-cutlery"></i>Calorie and Macronutrient Tracking</li><li><i class="fa fa-road"></i>Step Count Tracking</li><li><i class="fa fa-bar-chart-o"></i>Custom reports</li></ul></div><div class="col-md-6 partners"><h2>Integrates With:</h2><div class=row><div class="col-md-5 col-md-offset-1 col-xs-10 col-xs-offset-1"><div class="partner mfp"><img src=/assets/images/cde3dc57.logo-mfp.jpg alt=MyFitnessPal></div></div><div class="col-md-5 col-md-offset-0 col-xs-10 col-xs-offset-1"><div class="partner fitbit"><img src=/assets/images/64458637.logo-fitbit.jpg alt=Fitbit></div></div><div class="col-md-5 col-md-offset-1 col-xs-10 col-xs-offset-1"><div class=partner><p>More coming soon!</p></div></div></div></div></div></div><div ng-include="\'components/footer/footer.html\'"></div>'),a.put("components/footer/footer.html",'<div class="col-md-12 footer-clear"></div><div class="footer col-md-12"><div class=container><p class=text-muted>&copy; 2014 FitStats</p></div></div>'),a.put("components/navbar/navbar.html",'<!-- Navbar --><nav class="navbar navbar-default navbar-fixed-top" role=navigation ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button type=button class=navbar-toggle data-toggle=collapse data-target=.navbar-collapse><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand href="/">FitStats</a></div><div class="navbar-collapse collapse"><ul class="nav navbar-nav navbar-left" ng-show=isLoggedIn()><li ng-class="{active: isActive(\'/dashboard\')}"><a href=/dashboard><i class="fa fa-tachometer"></i>Dashboard</a></li><li ng-class="{active: isActive(\'/stats\')}"><a href=/stats><i class="fa fa-bar-chart-o"></i>Stats</a></li></ul><ul class="nav navbar-nav navbar-right"><li ng-show=!isLoggedIn() ng-class="{active: isActive(\'/login\')}"><a href=/login>Login</a></li><li ng-show=!isLoggedIn() ng-class="{active: isActive(\'/signup\')}"><a href=/signup class=signup>Signup</a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/settings\')}"><a href=/settings>{{ getCurrentUser().name }} Settings</a></li><li ng-show=isLoggedIn()><a href="" ng-click=logout()>Logout</a></li></ul></div><!--/.nav-collapse --></div></nav><!-- end navbar -->')}]);
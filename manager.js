/*! by Tom Thorogood <me@tomthorogood.co.uk> */
/*! This work is licensed under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/ or see LICENSE. */

/*global MPW, document, window, console */

//Variables for UI element
var mpw, givenName, familyName, masterPassword, domainName, securityQuestion, userName, type, resultType, generatePassword, password;

//Variable for calculations
var mpw, templateType, passwordType, fullName, error, id = 0;

//Constants - not using counter and using a set version of the algorithm
var COUNTER = 1, VERSION = 3;

function clearPassword() {
    password.value = "";
}

function updateMPW() {
	error.textContent = password.value = "";
	
    generatePassword.disabled = true;
    
    fullName = givenName.value + familyName.value;
    
	if (fullName ===''||
		!masterPassword.value ) {
		mpw = null;
        return; 
	}
	
	mpw = new MPW(fullName, masterPassword.value, VERSION);
	
	mpw.key.then(function() {
        generatePassword.disabled = false;
    } );
}

function updatePassword() {
	error.textContent = password.value = "";
	
    var calculatedDomainName, posWWW;
    
    calculatedDomainName = domainName.value;
    
    //Trim a leading www value if present
    posWWW = calculatedDomainName.indexOf("www.");
    if (posWWW===0) {
        calculatedDomainName = calculatedDomainName.substr(4);
    } 
    
    if (userName.value!=='') {
        calculatedDomainName = userName.value + calculatedDomainName;
    }
    
	if (!mpw || calculatedDomainName==='' || templateType==='' || passwordType==='') {
		return;
	}
	
	var cid = ++id;
    var value;
	
	if (type.value === "answer") {
		value = mpw.generateAnswer(calculatedDomainName, COUNTER, securityQuestion, templateType);
	} else {
		value = mpw["generate" + passwordType](calculatedDomainName, COUNTER, templateType);
	}
	
	value.then(function (pass) {
		if (cid === id) {
			password.value = pass;
		}
	}, function (err) {
		if (cid === id) {
			error.textContent = err.message;
		}
		
		console.error(err);
	});
}

function updateType() {
	resultType.textContent = type.selectedOptions[0].textContent;
    generatePassword.textContent = "Generate Password";
	
	securityQuestion.disabled = type.value !== "answer";

	switch (type.value) {
		case "login":
			passwordType = "Login";
            templateType = "name";            
            generatePassword.textContent = "Generate Username";
			break;
		case "maximum-password":
            passwordType = "Password";
			templateType = "maximum";
			break;
		case "long-password":
            passwordType = "Password";
			templateType = "long";
			break;
		case "medium-password":
            passwordType = "Password";
			templateType = "medium";
			break;
		case "basic-password":
            passwordType = "Password";
			templateType = "basic";
			break;
		case "short-password":
            passwordType = "Password";
			templateType = "short";
			break;
		case "pin":
            passwordType = "Password";
			templateType = "pin";
            generatePassword.textContent = "Generate PIN";
			break;
		case "answer":
            passwordType = "Answer";
			templateType = "phrase";
            generatePassword.textContent = "Generate Security Answer";
			break;
	}
	
	updatePassword();
}

window.addEventListener("load", function () {
	givenName = document.querySelector("[name=given-name]");
    familyName = document.querySelector("[name=family-name]");
	masterPassword = document.querySelector("[name=master-password]");
    generatePassword = document.querySelector("[name=generate-password]");
	domainName = document.querySelector("[name=domain]");
    securityQuestion = document.querySelector("[name=security-question]");
    userName = document.querySelector("[name=user-name]");
	type = document.querySelector("[name=type]");
	resultType = document.querySelector(".result-type");
	password  = document.querySelector(".password");
	error = document.querySelector(".error");
	
	givenName.disabled = familyName.disabled = masterPassword.disabled = domainName.disabled = userName.disabled = type.disabled = password.disabled = false;
	
	updateMPW();
	givenName.addEventListener("change", updateMPW, false);
    givenName.addEventListener("input", clearPassword, false);
	familyName.addEventListener("change", updateMPW, false);
    familyName.addEventListener("input", clearPassword, false);
	masterPassword.addEventListener("change", updateMPW, false);
    masterPassword.addEventListener("input", clearPassword, false);
    securityQuestion.addEventListener("input", clearPassword, false);
	domainName.addEventListener("input", clearPassword, false);
    userName.addEventListener("input", clearPassword, false);
	type.addEventListener("change", clearPassword, false);
	
	updateType();
	type.addEventListener("change", updateType, false);
	generatePassword.addEventListener("click", updatePassword, false);

    
	MPW.test().catch(function (err) {
		console.error(err);
		error.textContent = err.toString();
	});
}, false);
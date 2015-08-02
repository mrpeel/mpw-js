/*! by Tom Thorogood <me@tomthorogood.co.uk> */
/*! This work is licensed under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/ or see LICENSE. */

/*global MPW, document, window, console */

//Variables for UI element
var mpw, givenName, familyName, masterPassword, domainName, securityQuestion, userName, type, resultType, generatePassword, password, passwordCard, copyPassword, passwordSel;

//Variable for calculations
var mpw, templateType, passwordType, fullName, error, id = 0;

//Constants - not using counter and using a set version of the algorithm
var COUNTER = 1, VERSION = 3;

function clearPassword() {
    hidePasswordCard();
    password.textContent = "";
}

function updateMPW() {
	error.textContent = password.textContent = "";
	
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

function showPasswordCard() {
    passwordCard.classList.remove("hidden");
}

function hidePasswordCard() {
    passwordCard.classList.add("hidden");
}

function updatePassword() {
	error.textContent = password.textContent = "";
	
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
	
    showPasswordCard();
    
	if (type.value === "answer") {
		value = mpw.generateAnswer(calculatedDomainName, COUNTER, securityQuestion, templateType);
	} else {
		value = mpw["generate" + passwordType](calculatedDomainName, COUNTER, templateType);
	}
	
	value.then(function (pass) {
		if (cid === id) {
            password.textContent = pass;
            passwordSel.value = pass;
		}
	}, function (err) {
		if (cid === id) {
			error.textContent = err.message;
		}
		
		console.error(err);
	});
}

function updateType() {
    generatePassword.textContent = "Generate Password";
    copyPassword.textContent = "Copy Password";
	
	securityQuestion.disabled = type.value !== "answer";

	switch (type.value) {
		case "login":
			passwordType = "Login";
            templateType = "name";            
            generatePassword.textContent = "Generate User name";
            copyPassword.textContent = "Copy User name";
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
			copyPassword.textContent = "Copy PIN";
			break;
		case "answer":
            passwordType = "Answer";
			templateType = "phrase";
            generatePassword.textContent = "Generate Security Answer";
			copyPassword.textContent = "Copy Security Answer";
			break;
	}
	
	updatePassword();
}

function copyPasswordToClpiboard() {
    passwordSel.focus();
    passwordSel.select();
    document.execCommand("Copy", false, null);
    copyPassword.focus();
}

window.addEventListener("load", function () {
	givenName = document.querySelector("[id=given-name]");
    familyName = document.querySelector("[id=family-name]");
	masterPassword = document.querySelector("[id=master-password]");
    generatePassword = document.querySelector("[id=generate-password]");
	domainName = document.querySelector("[id=domain]");
    securityQuestion = document.querySelector("[id=security-question]");
    userName = document.querySelector("[id=user-name]");
	type = document.querySelector("[id=type]");
	passwordCard = document.querySelector("[id=password-card]");
    password  = document.querySelector(".password");
	error = document.querySelector(".error");
	passwordSel = document.querySelector("[id=password-select]");
	copyPassword = document.querySelector("[id=copy-password]");
	
	givenName.disabled = familyName.disabled = masterPassword.disabled = domainName.disabled = userName.disabled = type.disabled = false;
	
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
    copyPassword.addEventListener("click", copyPasswordToClpiboard, false);

    
	MPW.test().catch(function (err) {
		console.error(err);
		error.textContent = err.toString();
	});
}, false);
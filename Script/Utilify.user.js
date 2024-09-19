// ==UserScript==
// @name         Utilify: KoGaMa
// @namespace    discord.gg/C2ZJCZXKTu
// @version      4.0.4
// @description  KoGaMa Utility script that aims to port as much KoGaBuddy features as possible alongside adding my own.
// @author       ⛧ Simon
// @match        *://www.kogama.com/*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_download
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

// VIEW ALL ADDITIONAL INFORMATION ON OFFICIAL REPOSITORY
// - - > https://github.com/unreallain/Utilify < - - -
//  WILL NOT BE PUT ON GREASYFORK EVER AGAIN



(function() {
    function getCoupon(code) {
        return fetch("https://www.kogama.com/api/coupon/redeem/", {
            "headers": {
                "content-type": "application/json",
            },
            "body": JSON.stringify({ "code": code }),
            "method": "POST",
        });
    }

    const coupons = ['coolcat', 'fish', 'android', 'michal', 'scary', 'ifollowinstagram', 'banana', 'standalone-plugin-install'];

    function init() {
        if (window.location.href.includes('kogama.com/coupon/')) {
            const redeemButton = document.createElement('button');
            redeemButton.textContent = 'Redeem Coupons';
            redeemButton.style.position = 'fixed';
            redeemButton.style.top = '50%';
            redeemButton.style.left = '50%';
            redeemButton.style.transform = 'translate(-50%, -50%)';
            redeemButton.style.zIndex = '999';
            redeemButton.style.padding = '15px 30px';
            redeemButton.style.backgroundColor = '#222222';
            redeemButton.style.color = '#aaaaaa';
            redeemButton.style.border = 'none';
            redeemButton.style.borderRadius = '8px';
            redeemButton.style.fontSize = '16px';
            redeemButton.style.cursor = 'pointer';

            redeemButton.addEventListener('click', function() {
                Promise.all(coupons.map(getCoupon))
                    .then(() => {
                        window.location.href = 'https://www.kogama.com/profile/me';
                    })
                    .catch(() => {
                        alert('One or more requests failed');
                    });
            });

            document.body.appendChild(redeemButton);
        }
    }

    init();
})()

;(function () {
    'use strict';
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        return date.toLocaleString('en-GB', options);
    }
    function processComments(comments) {
        const commentElements = document.querySelectorAll('.MuiPaper-root.MuiPaper-outlined.MuiPaper-rounded');

        commentElements.forEach((element) => {
            if (element.getAttribute('data-timestamp-appended')) return;

            const usernameElement = element.querySelector('.MuiTypography-root.MuiLink-root');
            const commentContentElement = element.querySelector('._23o8J');

            if (usernameElement && commentContentElement) {
                const username = usernameElement.innerText;
                const commentContent = commentContentElement.innerText;

                const comment = comments.find(item =>
                    item.profile_username === username && JSON.parse(item._data).data === commentContent
                );

                if (comment) {
                    const timestamp = formatTimestamp(comment.created);
                    const infoDiv = document.createElement('div');
                    infoDiv.innerText = `Created: ${timestamp}`;
                    infoDiv.style.color = 'gray';
                    infoDiv.style.fontSize = 'small';
                    infoDiv.style.marginTop = '4px';
                    element.appendChild(infoDiv);
                    element.setAttribute('data-timestamp-appended', 'true');
                }
            }
        });
    }
    function toAbsoluteURL(url) {
        try {
            return new URL(url, window.location.origin).href;
        } catch (e) {
            console.error("Invalid URL: ", url);
            return null;
        }
    }
    function monitorNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const absoluteURL = toAbsoluteURL(args[0]);
            const response = await originalFetch.apply(this, [absoluteURL, ...args.slice(1)]);
            if (/\/comment\/\?/.test(absoluteURL)) {
                const url = new URL(absoluteURL);
                if ((url.pathname.includes("/game/") || url.pathname.includes("/feed/")) && url.searchParams.get('count')) {
                    response.clone().json().then(data => {
                        if (data && Array.isArray(data.data)) {
                            processComments(data.data);
                        }
                    });
                }
            }

            return response;
        };
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            const absoluteURL = toAbsoluteURL(url);

            this.addEventListener('load', function () {
                if (/\/comment\/\?/.test(absoluteURL)) {
                    const urlObj = new URL(absoluteURL);
                    if ((urlObj.pathname.includes("/game/") || urlObj.pathname.includes("/feed/")) && urlObj.searchParams.get('count')) {
                        try {
                            const response = JSON.parse(this.responseText);
                            if (response && Array.isArray(response.data)) {
                                processComments(response.data);
                            }
                        } catch (error) {
                            console.error("Error parsing comment data:", error);
                        }
                    }
                }
            });

            return originalXhrOpen.apply(this, [method, absoluteURL, ...rest]);
        };
    }
    function startCommentObserver() {
        setInterval(() => {
            const commentElements = document.querySelectorAll('.MuiPaper-root.MuiPaper-outlined.MuiPaper-rounded');
            commentElements.forEach((element) => {
                if (!element.getAttribute('data-timestamp-appended')) {
                }
            });
        }, 1500);
    }
    window.addEventListener('load', () => {
        monitorNetworkRequests();
        startCommentObserver();
    });

})()
;(function() {
    'use strict';

    function getCurrentVersion() {
        return GM_info.script.version;
    }

    function showUpdateNotification(latestVersion) {
        const updateDiv = document.createElement('div');
        updateDiv.id = 'update-notification';
        updateDiv.style.position = 'fixed';
        updateDiv.style.top = '-100px'
        updateDiv.style.left = '50%';
        updateDiv.style.transform = 'translateX(-50%)';
        updateDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        updateDiv.style.color = 'white';
        updateDiv.style.borderRadius = '8px';
        updateDiv.style.padding = '15px';
        updateDiv.style.boxShadow = '0px 4px 8px rgba(0,0,0,0.5)';
        updateDiv.style.zIndex = '9999';
        updateDiv.style.textAlign = 'center';
        updateDiv.style.transition = 'top 0.5s ease-in-out';
        updateDiv.style.fontFamily = 'Arial, sans-serif';
        updateDiv.style.fontSize = '16px';

        const updateMessage = document.createElement('p');
        updateMessage.textContent = `Update available! Newest version is `;
        updateDiv.appendChild(updateMessage);

        const versionLink = document.createElement('a');
        versionLink.href = 'https://github.com/unreallain/Utilify/raw/main/Script/Utilify.user.js';
        versionLink.textContent = latestVersion;
        versionLink.style.color = '#1E90FF';
        versionLink.style.textDecoration = 'underline';
        updateMessage.appendChild(versionLink);

        document.body.appendChild(updateDiv);

        setTimeout(() => {
            updateDiv.style.top = '0';
        }, 100);

        setTimeout(() => {
            updateDiv.style.top = '-100px';
            setTimeout(() => {
                document.body.removeChild(updateDiv);
            }, 500);
        }, 7000);
    }

    function checkForUpdate() {
        const githubAPIURL = 'https://api.github.com/repos/unreallain/Utilify/contents/Script/Utilify.user.js';

        fetch(githubAPIURL, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw'
            }
        })
        .then(response => response.text())
        .then(data => {
            const latestVersionMatch = data.match(/\/\/\s*@version\s+([0-9.]+)/);
            if (latestVersionMatch) {
                const latestVersion = latestVersionMatch[1];
                const currentVersion = getCurrentVersion();

                console.log(`Local Version: ${currentVersion}`);
                console.log(`Repository Version: ${latestVersion}`);

                if (latestVersion !== currentVersion) {
                    showUpdateNotification(latestVersion);
                } else {
                    console.log(`No update needed: Both versions are ${currentVersion}`);
                }
            } else {
                console.error("Unable to find the version in the fetched script.");
            }
        })
        .catch(err => console.error("Error fetching the script:", err));
    }

    checkForUpdate();
})()
;(function() {
    "use strict";
    function createElement(tag, attributes, ...children) {
        const element = document.createElement(tag);
        for (let key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        for (let child of children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        }
        return element;
    }
    function removeElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.remove();
        }
    }
    function createCustomLogin() {
        const loginButton = document.querySelector("#login-button");
        if (loginButton && !document.querySelector("#custom-login-button")) {
            const metaNav = document.querySelector("#meta-nav");
            if (metaNav) {
                loginButton.parentElement.remove();
                const customLoginButton = createElement(
                    "button",
                    {
                        id: "custom-login-button",
                        class: "custom-login-button",
                        "aria-label": "Custom Login"
                    },
                    "Login"
                );
                const signupButton = document.querySelector("#signup-button");
                metaNav.insertBefore(
                    createElement("li", { class: "login" }, customLoginButton),
                    signupButton.parentElement
                );

                customLoginButton.addEventListener("click", () => {
                    if (document.querySelector("#custom-login-form")) return;

                    const usernameInput = createElement("input", {
                        type: "text",
                        id: "custom-username",
                        placeholder: "Username",
                        class: "input-field"
                    });

                    const passwordInput = createElement("input", {
                        type: "password",
                        id: "custom-password",
                        placeholder: "Password",
                        class: "input-field"
                    });

                    const errorDisplay = createElement("div", {
                        id: "custom-login-error",
                        class: "error-display"
                    });

                    const addAccountButton = createElement("button", {
                        id: "add-account-button",
                        class: "action-button"
                    }, "Add Account");

                    const loginButton = createElement("button", {
                        id: "login-button",
                        class: "action-button"
                    }, "Login");

                    const loginForm = createElement(
                        "div",
                        {
                            id: "custom-login-form",
                            class: "login-form"
                        },
                        createElement("button", {
                            id: "close-login-form",
                            class: "close-button",
                            title: "Close"
                        }, "✕"),
                        createElement("div", {
                            id: "last-accounts",
                            class: "dropdown-container"
                        }),
                        usernameInput,
                        passwordInput,
                        addAccountButton,
                        loginButton,
                        errorDisplay,
                        createElement("div", {
                            id: "info-text",
                            class: "info-text"
                        }, "If you encounter issues registering while using Utilify, please disable it.")
                    );

                    document.body.appendChild(loginForm);

                    document.querySelector("#close-login-form").addEventListener("click", () => {
                        document.querySelector("#custom-login-form").remove();
                    });

                    addAccountButton.addEventListener("click", () => {
                        const username = usernameInput.value;
                        const password = passwordInput.value;
                        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
                        const existingAccountIndex = accounts.findIndex(
                            acc => acc.username === username
                        );
                        if (existingAccountIndex === -1) {
                            accounts.push({ username, password });
                            if (accounts.length > 8) accounts.shift(); // 8 - Max account held
                            localStorage.setItem("accounts", JSON.stringify(accounts));
                            displayLastAccounts();
                        }
                    });

                    loginButton.addEventListener("click", () => {
                        const username = usernameInput.value;
                        const password = passwordInput.value;

                        fetch("https://www.kogama.com/auth/login/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ username, password }),
                            credentials: "include"
                        })
                        .then(response => {
                            if (response.status === 200) {
                                window.location.href = "https://www.kogama.com/profile/me";
                            } else {
                                return response.json();
                            }
                        })
                        .then(data => {
                            if (data && data.error) {
                                let errorMessage = "Login failed.";
                                if (data.error.__all__) {
                                    const detailedError = data.error.__all__[0];
                                    if (detailedError.includes("banned")) {
                                        errorMessage = "Account banned.";
                                        const remainingTimeMatch = detailedError.match(/You'll remain banned for another ([\d\D]+)\./);
                                        const remainingTime = remainingTimeMatch ? remainingTimeMatch[1].trim() : '';
                                        errorDisplay.innerHTML = `
                                            <div>Account banned.</div>
                                            <div style="color: darkorange;">${remainingTime ? `${remainingTime} left` : ''}</div>
                                        `;
                                        errorDisplay.title = detailedError.split("due to:")[1].split("\n")[0].trim();
                                    } else {
                                        errorMessage = "Inappropriate Username or password.";
                                    }
                                }
                                if (!data.error.__all__ || !data.error.__all__[0].includes("banned")) {
                                    errorDisplay.textContent = errorMessage;
                                }
                            }
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            errorDisplay.style.display = "block";
                            errorDisplay.textContent = "Network error. Please try again later.";
                        });
                    });

                    function displayLastAccounts() {
                        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
                        const lastAccountsDropdown = document.querySelector("#last-accounts");
                        lastAccountsDropdown.innerHTML = ""; // Clear existing options

                        const dropdown = createElement("select", {
                            id: "last-accounts-dropdown",
                            class: "dropdown"
                        });
                        const defaultOption = createElement("option", { value: "" }, "Select an account");
                        dropdown.appendChild(defaultOption);

                        accounts.forEach(account => {
                            const accountOption = createElement(
                                "option",
                                { value: JSON.stringify(account) },
                                account.username
                            );
                            dropdown.appendChild(accountOption);
                        });

                        dropdown.addEventListener("change", function() {
                            const selectedAccount = JSON.parse(this.value);
                            if (selectedAccount) {
                                const { username, password } = selectedAccount;

                                fetch("https://www.kogama.com/auth/login/", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({ username, password }),
                                    credentials: "include"
                                })
                                .then(response => {
                                    if (response.status === 200) {
                                        window.location.href = "https://www.kogama.com/profile/me";
                                    } else {
                                        return response.json();
                                    }
                                })
                                .then(data => {
                                    if (data && data.error) {
                                        let errorMessage = "Login failed.";
                                        if (data.error.__all__) {
                                            const detailedError = data.error.__all__[0];
                                            if (detailedError.includes("banned")) {
                                                errorMessage = "Account banned.";
                                                const remainingTimeMatch = detailedError.match(/You'll remain banned for another ([\d\D]+)\./);
                                                const remainingTime = remainingTimeMatch ? remainingTimeMatch[1].trim() : '';
                                                errorDisplay.innerHTML = `
                                                    <div>Account banned.</div>
                                                    <div style="color: darkorange;">${remainingTime ? `${remainingTime} left` : ''}</div>
                                                `;
                                                errorDisplay.title = detailedError.split("due to:")[1].split("\n")[0].trim();
                                            } else {
                                                errorMessage = "Inappropriate Username or password.";
                                            }
                                        }
                                        if (!data.error.__all__ || !data.error.__all__[0].includes("banned")) {
                                            errorDisplay.textContent = errorMessage;
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    errorDisplay.style.display = "block";
                                    errorDisplay.textContent = "Network error. Please try again later.";
                                });
                            }
                        });

                        lastAccountsDropdown.appendChild(dropdown);
                    }
                    displayLastAccounts();
                });
            }
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const throttledCreateCustomLogin = debounce(createCustomLogin, 210);

    const observer = new MutationObserver(mutationsList => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                throttledCreateCustomLogin();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Add CSS styles
    GM_addStyle(`
        .custom-login-button {
            background-color: #4a148c;
            color: white;
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 18px;
            border-radius: 6px;
            transition: background-color 0.3s ease;
        }
        .custom-login-button:hover {
            background-color: #6a1b9a;
        }
        .login-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            padding: 20px;
            border: 1px solid #3f3f5f;
            border-radius: 12px;
            width: 450px;
            z-index: 9999;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .input-field {
            background: #2b2b3a;
            color: #e0e0e0;
            border: 1px solid #3f3f5f;
            padding: 12px;
            margin-bottom: 12px;
            width: 100%;
            border-radius: 6px;
        }
        .action-button {
            background-color: #6a1b9a;
            color: white;
            border: none;
            padding: 12px;
            cursor: pointer;
            font-size: 18px;
            border-radius: 6px;
            margin: 5px;
            transition: background-color 0.3s ease;
        }
        .action-button:hover {
            background-color: #8e24aa;
        }
        .close-button {
            position: absolute;
            top: 12px;
            right: 12px;
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        .error-display {
            color: #ff4d4d;
            font-size: 16px;
            margin-top: 12px;
        }
        .info-text {
            color: #b0bec5;
            font-size: 16px;
            margin-top: 12px;
            text-align: center;
        }
        .dropdown-container {
            width: 100%;
            margin-bottom: 12px;
        }
        .dropdown {
            width: 100%;
            padding: 10px;
            border: 1px solid #3f3f5f;
            background: #2b2b3a;
            color: #e0e0e0;
            border-radius: 6px;
        }
    `);
})()
;(function() {
    const patterns = {
        bold: /\*\*(.*?)\*\*/g,
        italic: /\*(.*?)\*/g,
        underline: /__(.*?)__/g,
        codeBlock: /```\n([\s\S]*?)\n```/g,
        inlineCode: /`(.*?)`/g,
        spoiler: /\|\|(.+?)\|\|/g,
        header: /^(#{1,6})\s(.*)$/gm,
        link: /\[(.*?)\]\((.*?)\)/g,
        list: /^(\*|\d+\.)\s+(.*)$/gm
    };

    function sanitizeUrl(url) {
        try {
            let sanitizedUrl = url.trim().replace(/[\s<>"'{}|\\^`]/g, '');
            if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
                sanitizedUrl = `http://${sanitizedUrl}`;
            }
            return encodeURI(sanitizedUrl);
        } catch (e) {
            console.error(`Failed to sanitize URL: ${url}`, e);
            return '';
        }
    }
    function formatText(text) {
        let formattedText = text;

        formattedText = formattedText.replace(patterns.bold, '<strong>$1</strong>');
        formattedText = formattedText.replace(patterns.italic, '<em>$1</em>');
        formattedText = formattedText.replace(patterns.underline, '<u>$1</u>');
        formattedText = formattedText.replace(patterns.codeBlock, '<pre><code>$1</code></pre>');
        formattedText = formattedText.replace(patterns.inlineCode, '<code>$1</code>');
        formattedText = formattedText.replace(patterns.spoiler, '<span class="spoiler">$1</span>');
        formattedText = formattedText.replace(patterns.header, (match, hashes, content) => {
            const level = hashes.length;
            return `<h${level}>${content}</h${level}>`;
        });
        formattedText = formattedText.replace(patterns.link, (match, text, url) => {
            const href = sanitizeUrl(url);
            return href ? `<a class="markdown-link" href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>` : text;
        });
        formattedText = formattedText.replace(patterns.list, (match, prefix, content) => {
            const isOrdered = /^\d+\./.test(prefix);
            return isOrdered ? `<ol><li>${content}</li></ol>` : `<ul><li>${content}</li></ul>`;
        });

        return formattedText;
    }
    function formatTextNodes(container) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
            const originalText = node.nodeValue;
            const formattedText = formatText(originalText);
            if (originalText !== formattedText) {
                const newNode = document.createRange().createContextualFragment(formattedText);
                node.parentNode.replaceChild(newNode, node);
            }
        }
    }
    function formatDocument() {
        formatTextNodes(document.body);
    }
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .spoiler {
                filter: blur(5px);
                border-radius: 3px;
                padding: 0 2px;
                cursor: pointer;
                transition: 0.6s ease-in-out all;
            }
            .spoiler:hover {
                filter: blur(0px);
                transition: 0.6s ease-in-out all;
            }
            .markdown-link {
                color: #cda6d1 !important;
            }
            ul, ol {
                padding-left: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        addStyles();
        formatDocument();
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            formatTextNodes(node);
                        }
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();
})()
;(function() {
    'use strict';

    const currentURL = window.location.href;
    const urlPattern = /^https:\/\/www\.kogama\.com\/profile\/\d+\/edit\/$/;

    if (!urlPattern.test(currentURL)) {
        return;
    }

    const pathSegments = window.location.pathname.split('/');
    const profileID = pathSegments[2];
    const purchaseHistoryURL = `https://www.kogama.com/user/${profileID}/purchase-history/?page=1&count=12&order=desc`;
    const gameDataBaseURL = `https://www.kogama.com/game/?page=`;

    const button = $('<button id="scrapeButton">Download Account Log</button>').css({
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        backgroundColor: '#44475a',
        color: '#f8f8f2',
        borderRadius: '8px',
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '0 0 4px #4DFF4D',
        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
        transition: 'box-shadow 0.8s ease-in-out',
    }).hover(
        function() {
            $(this).css('box-shadow', '0 0 12px #7FFF7F');
        },
        function() {
            $(this).css('box-shadow', '0 0 4px #4DFF4D');
        }
    );

    $('body').append(button);

    button.on('click', function() {
        showLoadingOverlay();
        fetchUserDetails(profileID);
    });

    function showLoadingOverlay() {
        const overlay = $('<div id="loadingOverlay"></div>').css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        });

        const spinner = $('<div class="spinner"></div>').css({
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #3498db',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite'
        });

        const message = $('<div id="loadingMessage">Acquiring Account Credentials...</div>').css({
            color: '#fff',
            fontSize: '18px',
            marginTop: '20px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        $('<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>').appendTo('head');
        overlay.append(spinner).append(message);
        $('body').append(overlay);
    }

    function updateLoadingMessage(message) {
        $('#loadingMessage').text(message);
    }

    function hideLoadingOverlay() {
        $('#loadingOverlay').remove();
    }

    function fetchUserDetails(profileID) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://www.kogama.com/profile/${profileID}/`,
            onload: function(response) {
                try {
                    const html = response.responseText;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    const scripts = doc.querySelectorAll('head > script');
                    let userDataScript = null;

                    for (const script of scripts) {
                        if (script.innerHTML.includes('options.bootstrap')) {
                            userDataScript = script;
                            break;
                        }
                    }

                    if (userDataScript) {
                        const bootstrapDataMatch = userDataScript.innerHTML.match(/options\.bootstrap\s*=\s*({[\s\S]*?});/);
                        if (bootstrapDataMatch) {
                            const bootstrapData = bootstrapDataMatch[1];
                            const parsedData = JSON.parse(bootstrapData);
                            const userObject = parsedData.object;

                            if (userObject.is_me) {
                                const accountDetails = {
                                    username: userObject.username,
                                    id: userObject.id,
                                    description: userObject.description,
                                    email: userObject.email,
                                    birthdate: userObject.birthdate,
                                    created: userObject.created,
                                    lastping: userObject.last_ping,
                                    isMe: userObject.is_me,
                                    friends: userObject.friends,
                                    leaderboardRank: userObject.leaderboard_rank,
                                    level: userObject.level,
                                    friendsLimit: userObject.friends_limit,
                                    xp: userObject.xp,
                                    gold: userObject.gold,
                                    silver: userObject.silver
                                };

                                fetchPurchaseHistory(purchaseHistoryURL, accountDetails);
                            } else {
                                hideLoadingOverlay();
                            }
                        } else {
                            hideLoadingOverlay();
                        }
                    } else {
                        hideLoadingOverlay();
                    }
                } catch (error) {
                    hideLoadingOverlay();
                }
            },
            onerror: function() {
                hideLoadingOverlay();
            }
        });
    }

    function fetchPurchaseHistory(url, accountDetails) {
        updateLoadingMessage('Obtaining Purchase History');
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    const purchases = data.data.map(purchase => ({
                        ServiceName: purchase.ServiceName,
                        AmountGross: purchase.AmountGross,
                        AmountNet: purchase.AmountNet,
                        CurrencyCode: purchase.CurrencyCode,
                        CountryCode: purchase.CountryCode,
                        Quantity: purchase.Quantity,
                        ProductType: purchase.ProductType,
                        TransactionID: purchase.TransactionID,
                        ProfileID: purchase.ProfileID,
                        PaymentMethod: purchase.PaymentMethod,
                        PaymentProvider: purchase.PaymentProvider,
                        Status: purchase.Status,
                        Created: purchase.Created,
                        Modified: purchase.Modified,
                        Count: purchase.Count,
                        Dimension: purchase.Dimension,
                        ProductID: purchase.ProductID,
                        Name: purchase.Name
                    }));
                    updateLoadingMessage('Obtaining Unpublished Projects');
                    fetchGameData(1, [], purchases, accountDetails);
                } catch (error) {
                    hideLoadingOverlay();
                }
            },
            onerror: function() {
                hideLoadingOverlay();
            }
        });
    }

    function fetchGameData(counter, games, purchases, accountDetails) {
        if (counter > 30) {
            generateSHA256Hash(JSON.stringify(accountDetails) + Date.now()).then(backupHash => {
                const accountLog = {
                    '--backupdate': new Date().toLocaleString('en-GB', {
                        timeZoneName: 'short',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    '--backupID': generateBackupID(profileID),
                    '--backuphash': backupHash,
                    '--account_details': accountDetails,
                    '--private_projects': games,
                    '--purchases': purchases
                };

                const jsonString = JSON.stringify(accountLog, null, 4);
                const filename = `${profileID}.json`;

                try {
                    GM_download({
                        url: URL.createObjectURL(new Blob([jsonString], { type: 'application/json' })),
                        name: filename,
                        onload: function() {
                            hideLoadingOverlay();
                        },
                        onerror: function() {
                            fallbackDownload(jsonString, filename);
                        }
                    });
                } catch (error) {
                    fallbackDownload(jsonString, filename);
                }
            }).catch(error => {
                hideLoadingOverlay();
            });
        } else {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${gameDataBaseURL}${counter}&count=12&filter=owner`,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const filteredGames = data.data
                            .filter(game => game.is_public === 0)
                            .map(game => ({
                                name: game.name,
                                created: game.created
                            }));
                        fetchGameData(counter + 1, games.concat(filteredGames), purchases, accountDetails);
                    } catch (error) {
                        hideLoadingOverlay();
                    }
                },
                onerror: function() {
                    hideLoadingOverlay();
                }
            });
        }
    }

    function generateSHA256Hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        return crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        });
    }

    function generateBackupID(uid) {
        const now = new Date().toISOString();
        const base64Time = btoa(now);
        const randomString = generateRandomID();
        return `${uid}.${base64Time}.${randomString}`;
    }

    function generateRandomID() {
        const chars = 'QvcFxzTopsALmnToXOR3G';
        const nums = '1234567890';
        let id = '';
        for (let i = 0; i < 4; i++) {
            id += nums[Math.floor(Math.random() * nums.length)];
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    function fallbackDownload(jsonString, filename) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            hideLoadingOverlay();
        }, 0);
    }

})();

;(function () {
	"use strict"

	function checkURL() {
		const urlPattern =
			/^https:\/\/www\.kogama\.com\/profile\/[^\/]+\/blocked\/$/
		return urlPattern.test(window.location.href)
	}

	function addCustomMenu() {
		if (!checkURL()) return

		const menuContainer = document.createElement("div")
		menuContainer.id = "custom-menu-container"
		menuContainer.style.position = "fixed"
		menuContainer.style.top = "5%"
		menuContainer.style.left = "50%"
		menuContainer.style.transform = "translateX(-50%)"
		menuContainer.style.zIndex = "9999"
		menuContainer.style.backgroundColor = "#313131"
		menuContainer.style.padding = "10px"
		menuContainer.style.border = "1px solid #866868"
		menuContainer.style.borderRadius = "13px"

		const copyListButton = createButton("Copy entire list", copyEntireList)
		const copyUsernamesButton = createButton("Copy usernames", copyUsernames)
		const copyUIDsButton = createButton("Copy UIDs", copyUIDs)

		menuContainer.appendChild(copyListButton)
		menuContainer.appendChild(copyUsernamesButton)
		menuContainer.appendChild(copyUIDsButton)

		document.body.appendChild(menuContainer)
	}

	function createButton(text, clickHandler) {
		const button = document.createElement("button")
		button.textContent = text
		button.style.marginRight = "10px"
		button.style.backgroundColor = "#423B3B"
		button.style.borderRadius = "13px"
		button.addEventListener("click", clickHandler)
		return button
	}

	function copyEntireList() {
		const blockedUsers = document.querySelectorAll(".user-row")
		let copyContent = ""

		blockedUsers.forEach(user => {
			const usernameElement = user.querySelector(".control-group a")
			const uidElement = user.querySelector('input[name="profile_id"]')
			if (usernameElement && uidElement) {
				const username = usernameElement.textContent.trim()
				const uid = uidElement.value
				copyContent += `${username} : ${uid}\n`
			}
		})

		GM_setClipboard(copyContent)
		displayNotification("Entire list copied to clipboard!")
	}

	function copyUsernames() {
		const blockedUsers = document.querySelectorAll(".user-row")
		let copyContent = ""

		blockedUsers.forEach(user => {
			const usernameElement = user.querySelector(".control-group a")
			if (usernameElement) {
				const username = usernameElement.textContent.trim()
				copyContent += `${username}\n`
			}
		})

		GM_setClipboard(copyContent)
		displayNotification("Usernames copied to clipboard!")
	}

	function copyUIDs() {
		const blockedUsers = document.querySelectorAll(".user-row")
		let copyContent = ""

		blockedUsers.forEach(user => {
			const uidElement = user.querySelector('input[name="profile_id"]')
			if (uidElement) {
				const uid = uidElement.value
				copyContent += `${uid}\n`
			}
		})

		GM_setClipboard(copyContent)
		displayNotification("UIDs copied to clipboard!")
	}

	function displayNotification(message) {
		const notification = document.createElement("div")
		notification.textContent = message
		notification.style.position = "fixed"
		notification.style.top = "10%"
		notification.style.left = "50%"
		notification.style.transform = "translateX(-50%)"
		notification.style.zIndex = "10000"
		notification.style.backgroundColor = "#4CAF50"
		notification.style.color = "white"
		notification.style.padding = "15px"
		notification.style.borderRadius = "10px"
		notification.style.textAlign = "center"
		notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)"

		document.body.appendChild(notification)

		setTimeout(() => {
			notification.parentNode.removeChild(notification)
		}, 3000)
	}

	window.addEventListener("load", addCustomMenu)
})()

;(function () {
    "use strict";

    function isMassPurchaseURL() {
        return window.location.pathname.endsWith("/masspurchase");
    }

    if (!isMassPurchaseURL()) {
        return;
    }
    var menuDiv = document.createElement("div");
    menuDiv.style.position = "fixed";
    menuDiv.style.top = "50%";
    menuDiv.style.left = "50%";
    menuDiv.style.transform = "translate(-50%, -50%)";
    menuDiv.style.background = "rgba(255, 255, 255, 0.1)";
    menuDiv.style.padding = "20px";
    menuDiv.style.zIndex = "999";
    menuDiv.style.boxShadow = "0px 0px 15px rgba(0,0,0,0.5)";
    menuDiv.style.borderRadius = "15px";
    menuDiv.style.backdropFilter = "blur(15px)";
    menuDiv.style.height = "410px";
    menuDiv.style.width = "300px";
    menuDiv.style.display = "flex";
    menuDiv.style.flexDirection = "column";
    menuDiv.style.justifyContent = "space-between";

    var createLabelWithInput = (labelText, inputType) => {
        var label = document.createElement("label");
        label.textContent = labelText;
        label.style.color = "#fff";
        label.style.fontWeight = "bold";
        label.style.marginBottom = "5px";

        var input = document.createElement("input");
        input.type = inputType;
        input.style.backgroundColor = "rgba(0, 0, 50, 0.5)";
        input.style.color = "#fff";
        input.style.padding = "10px";
        input.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        input.style.borderRadius = "10px";
        input.style.width = "100%";
        input.style.boxSizing = "border-box";

        label.appendChild(input);
        return { label, input };
    };
    var objectTypeLabel = document.createElement("label");
    objectTypeLabel.textContent = " ";
    objectTypeLabel.style.color = "#fff";
    objectTypeLabel.style.fontWeight = "bold";

    var objectTypeSelect = document.createElement("select");
    var avatarOption = document.createElement("option");
    avatarOption.value = "avatar";
    avatarOption.textContent = "Avatar";
    var modelOption = document.createElement("option");
    modelOption.value = "model";
    modelOption.textContent = "Model";
    objectTypeSelect.appendChild(avatarOption);
    objectTypeSelect.appendChild(modelOption);
    objectTypeSelect.style.backgroundColor = "rgba(0, 0, 50, 0.5)";
    objectTypeSelect.style.color = "#fff";
    objectTypeSelect.style.padding = "10px";
    objectTypeSelect.style.border = "1px solid rgba(255, 255, 255, 0.3)";
    objectTypeSelect.style.borderRadius = "10px";
    objectTypeSelect.style.width = "100%";
    objectTypeSelect.style.boxSizing = "border-box";
    objectTypeLabel.appendChild(objectTypeSelect);
    menuDiv.appendChild(objectTypeLabel);

    var { label: objectIdLabel, input: objectIdInput } = createLabelWithInput("ID:", "text");
    menuDiv.appendChild(objectIdLabel);

    var { label: loopAmountLabel, input: loopAmountInput } = createLabelWithInput("TIMES TO BUY:", "number");
    menuDiv.appendChild(loopAmountLabel);
    var goldRequiredText = document.createElement("div");
    goldRequiredText.style.color = "#FFD700";
    goldRequiredText.style.marginTop = "10px";
    goldRequiredText.style.fontWeight = "bold";
    goldRequiredText.textContent = "Gold Required: 0";
    menuDiv.appendChild(goldRequiredText);

    var targetReceivesText = document.createElement("div");
    targetReceivesText.style.color = "#fff";
    targetReceivesText.style.marginTop = "10px";
    targetReceivesText.style.fontWeight = "bold";
    targetReceivesText.textContent = "Target Receives: 0 gold";
    menuDiv.appendChild(targetReceivesText);

    var purchaseButton = document.createElement("button");
    purchaseButton.textContent = "PURCHASE";
    purchaseButton.style.backgroundColor = "#6a0dad";
    purchaseButton.style.color = "white";
    purchaseButton.style.padding = "10px";
    purchaseButton.style.border = "none";
    purchaseButton.style.borderRadius = "10px";
    purchaseButton.style.width = "100%";
    purchaseButton.style.marginTop = "20px";
    purchaseButton.style.cursor = "pointer";
    menuDiv.appendChild(purchaseButton);

    document.body.appendChild(menuDiv);

    var infoDiv = document.createElement("div");
    infoDiv.style.position = "fixed";
    infoDiv.style.bottom = "20px";
    infoDiv.style.left = "50%";
    infoDiv.style.transform = "translateX(-50%)";
    infoDiv.style.background = "rgba(0, 0, 0, 0.8)";
    infoDiv.style.padding = "10px";
    infoDiv.style.borderRadius = "10px";
    infoDiv.style.color = "#fff";
    infoDiv.style.zIndex = "999";
    infoDiv.textContent = "No requests sent yet.";
    document.body.appendChild(infoDiv);

    purchaseButton.addEventListener("click", function () {
        var objectType = objectTypeSelect.value;
        var objectId = objectIdInput.value;
        var loopCount = parseInt(loopAmountInput.value);

        if (loopCount < 0) {
            loopCount = 0;
            loopAmountInput.value = 0;
        }

        var count = 0;
        var successCount = 0;

        function purchaseWithDelay() {
            var fetchURL = "";
            if (objectType === "avatar") {
                fetchURL = `https://www.kogama.com/model/market/a-${objectId}/purchase/`;
            } else if (objectType === "model") {
                fetchURL = `https://www.kogama.com/model/market/i-${objectId}/purchase/`;
            }

            fetch(fetchURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            })
                .then(response => {
                    if (response.ok) {
                        successCount++;
                        updateInfoDiv(count, successCount, loopCount);
                    } else {
                        updateInfoDiv(count, successCount, loopCount, false);
                    }
                })
                .catch(error => {
                    updateInfoDiv(count, successCount, loopCount, false);
                })
                .finally(() => {
                    count++;
                    if (count < loopCount) {
                        setTimeout(purchaseWithDelay, 30000);
                    }
                });
        }

        purchaseWithDelay();
    });

    function updateGoldAndTargetText() {
        var objectType = objectTypeSelect.value;
        var loopCount = parseInt(loopAmountInput.value);

        var goldRequired = 0;
        var targetReceives = 0;
        if (objectType === "avatar") {
            goldRequired = Math.max(0, 140 * loopCount);
            targetReceives = Math.max(0, 14 * loopCount);
        } else if (objectType === "model") {
            goldRequired = Math.max(0, 10 * loopCount);
            targetReceives = Math.max(0, loopCount);
        }

        goldRequiredText.textContent = `Gold Required: ${goldRequired}`;
        targetReceivesText.textContent = `Target Receives: ${targetReceives} gold`;
    }

    loopAmountInput.addEventListener("input", function () {
        var loopAmountValue = parseInt(loopAmountInput.value);
        if (loopAmountValue < 0) {
            loopAmountInput.value = 0;
        }
        updateGoldAndTargetText();
    });

    objectTypeSelect.addEventListener("change", updateGoldAndTargetText);

    function updateInfoDiv(count, successCount, totalRequests, isSuccess = true) {
        if (isSuccess) {
            var suffix = getOrdinalSuffix(successCount);
            infoDiv.textContent = `Object bought for the ${successCount}${suffix} time out of ${totalRequests} requests.`;
        } else {
            infoDiv.textContent = `Failed to purchase object. ${count} requests sent, ${successCount} successfully bought.`;
        }
    }

    function getOrdinalSuffix(number) {
        var suffixes = ["th", "st", "nd", "rd"];
        var remainder = number % 100;
        return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
    }
})();


;(function () {
	"use strict"

	function removeElementsAndUpdateStyles() {
		var rectElements = document.querySelectorAll(".UA3TP rect")
		rectElements.forEach(function (rectElement) {
			rectElement.parentNode.removeChild(rectElement)
		})

		var nestedElements = document.querySelectorAll(".UA3TP ._11RkC")
		nestedElements.forEach(function (nestedElement) {
			nestedElement.style.stroke = "transparent"
		})

		var svgElements = document.querySelectorAll(".Hkdag")
		svgElements.forEach(function (svgElement) {
			svgElement.parentNode.removeChild(svgElement)
		})
	}

	function handleMutations(mutationsList) {
		mutationsList.forEach(function (mutation) {
			mutation.addedNodes.forEach(function (node) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					var rectElements = node.querySelectorAll(".UA3TP rect")
					rectElements.forEach(function (rectElement) {
						rectElement.parentNode.removeChild(rectElement)
					})

					var nestedElements = node.querySelectorAll(".UA3TP ._11RkC")
					nestedElements.forEach(function (nestedElement) {
						nestedElement.style.stroke = "transparent"
					})

					var svgElements = node.querySelectorAll(".Hkdag")
					svgElements.forEach(function (svgElement) {
						svgElement.parentNode.removeChild(svgElement)
					})
				}
			})
		})
	}

	var observer = new MutationObserver(handleMutations)

	observer.observe(document.body, { childList: true, subtree: true })

	window.addEventListener("load", function () {
		removeElementsAndUpdateStyles()
	})
})()
GM_addStyle(`

    ._13UrL .kR267 ._9smi2 ._1rJI8:not(::before):not(::after) {
        filter: none; /* Resetting filter for pseudo-elements */
    }
    /* Initially hide the timestamps */
    .MuiCardHeader-subheader {
        opacity: 0;
        transition: opacity 0.6s ease-in-out;
    }

    /* On hover, make the timestamps visible */
    .MuiCardHeader-content:hover .MuiCardHeader-subheader {
        opacity: 0.6;
        }
        ._13UrL ._23KvS ._33DXe {
        filter: blur(4px) !important;
        }
               ._33DXe::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; /* Adjust this to change the gradient length */
            height: 100%;
            background: linear-gradient(to right, rgba(31, 30, 30, 0.432), rgba(0, 0, 0, 0.036));
            pointer-events: none;
        }

`)


;(function () {
	"use strict"

	const gameInfoKeyName = "__amplify__cache:game:last-played"
	const notifyKeyNamePrefix = "__amplify__cache:notify:gen:"
	const currentURL = window.location.href

	function getUIDNFromLocalStorage() {
		const keys = Object.keys(localStorage)
		for (let key of keys) {
			if (key.startsWith(notifyKeyNamePrefix)) {
				const uidn = key.substring(notifyKeyNamePrefix.length)
				return uidn
			}
		}
		return null
	}

	function editGameTitleAndAddProfileLink() {
		const targetElementSelector = "div._1jTCU > span._20K92"
		const targetElement = document.querySelector(targetElementSelector)
		if (targetElement && localStorage.getItem(gameInfoKeyName)) {
			const value = JSON.parse(localStorage.getItem(gameInfoKeyName))
			const gameTitle = value.data.name
			const gameId = value.data.id

			const newContent = document.createElement("span")
			newContent.innerHTML = `<a href="https://www.kogama.com/games/play/${gameId}/" style="color: #007bff; text-decoration: none; font-weight: bold;">${gameTitle}</a>, ${targetElement.textContent}`

			targetElement.innerHTML = ""
			targetElement.appendChild(newContent)
		}
	}
	function waitForDOMAndDelay() {
		setTimeout(() => {
			const profileUIDN = getUIDNFromLocalStorage()
			if (
				profileUIDN &&
				currentURL === `https://www.kogama.com/profile/${profileUIDN}/`
			) {
				editGameTitleAndAddProfileLink()
			}
		}, 1500)
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", waitForDOMAndDelay)
	} else {
		waitForDOMAndDelay()
	}
})()

;(function() {
    'use strict';

    function formatDate(date) {
        return date.toLocaleString([], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        });
    }

    function displayLastOnlineStatus() {
        let scripts = document.querySelectorAll('script');
        let lastPing = null;

        for (let script of scripts) {
            if (script.innerText.includes('last_ping')) {
                let lastPingMatch = script.innerText.match(/"last_ping"\s*:\s*"([^"]+)"/);
                if (lastPingMatch && lastPingMatch[1]) {
                    lastPing = lastPingMatch[1];
                    break;
                }
            }
        }

        if (lastPing) {
            let lastOnlineDate = new Date(lastPing);
            let now = new Date();
            let diffMs = now - lastOnlineDate;
            let diffMins = Math.floor(diffMs / 60000);
            let timeString = formatDate(lastOnlineDate);

            let statusText = '';
            let color = '';

            if (diffMins < 5) { // Within 5 minutes - online
                statusText = 'Currently Online';
                color = 'lightgreen';
            } else if (diffMins < 15) { // within 15 minutes - last offline $amount minutes ago
                statusText = `Last online ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                color = '#f8b38a';
            } else {
                statusText = `Last Online: ${timeString}`; // otherwise display formatted timestamp
                color = 'lightgray';
            }

            let targetContainer = document.querySelector('div._1jTCU');
            let targetElement = targetContainer ? targetContainer.querySelector('span._20K92') : null;

            if (targetContainer) {
                let spacerElement = document.createElement('div');
                spacerElement.style.height = '20px';
                spacerElement.style.width = '100%';
                spacerElement.style.backgroundColor = 'transparent';
                spacerElement.style.marginBottom = '10px';
                targetContainer.parentNode.insertBefore(spacerElement, targetContainer);

                let statusElement = document.createElement('div');
                statusElement.textContent = statusText;
                statusElement.style.fontSize = '11px';
                statusElement.style.color = color;
                statusElement.style.marginTop = '5px';
                statusElement.style.zIndex = '999';
                statusElement.style.position = 'relative';
                statusElement.style.left = '0';
                statusElement.style.display = 'block';

                if (targetElement) {
                    targetElement.parentNode.insertBefore(statusElement, targetElement.nextSibling);
                }
            }
        }
    }

    function observeDOMChanges() {
        const observer = new MutationObserver((mutations, obs) => {
            let targetContainer = document.querySelector('div._1jTCU');
            if (targetContainer) {
                obs.disconnect();
                displayLastOnlineStatus();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('load', function() {
        observeDOMChanges();
    });
})();

;(function () {
	"use strict"

	if (
		!/^https:\/\/www\.kogama\.com\/profile\/\d+\/avatars\/?$/.test(
			window.location.href,
		)
	) {
		return
	}

	function addButtonsToAvatar(avatar) {
		if (avatar.querySelector(".marketplace-button")) {
			return
		}
		const avatarNameElement = avatar.querySelector("._2uIZL")
		const avatarName = avatarNameElement.textContent.trim()
		const backgroundImageStyle = avatar
			.querySelector("._3Up3H")
			.getAttribute("style")
		const imageUrlMatch = backgroundImageStyle.match(/url\("([^"]+)"\)/)
		const imageUrl = imageUrlMatch ? imageUrlMatch[1] : ""

		const marketplaceButton = document.createElement("button")
		marketplaceButton.textContent = "Find"
		marketplaceButton.className = "marketplace-button"
		marketplaceButton.style.cssText = `
            position: absolute;
            bottom: 15%;
            left: 37%;
            z-index: 999;
            padding: 6px 12px;
            background-color: #1a1a1a;
            color: #fff;
            border: none;
            border-radius: 17px;
            cursor: pointer;
        `

		marketplaceButton.addEventListener("click", function () {
			const requestUrl = `https://www.kogama.com/model/market/?page=1&count=7000&order=undefined&category=avatar&orderBy=created&q=${encodeURIComponent(avatarName)}`

			fetch(requestUrl)
				.then(response => response.json())
				.then(data => {
					if (data.data.length === 1) {
						console.log("Single object found:")
						console.log(data.data[0])
						openMarketplacePage(data.data[0])
					} else {
						let foundMatch = false
						const results = []
						for (const object of data.data) {
							if (getBaseUrl(object.image_large) === getBaseUrl(imageUrl)) {
								console.log("Match Found:")
								console.log(object)
								foundMatch = true
								openMarketplacePage(object)
								break
							}
							results.push(object)
						}
						if (!foundMatch) {
							showModal(results)
						}
					}
				})
				.catch(error => {
					console.error("Error fetching data:", error)
				})
		})

		avatar.style.position = "relative"
		avatar.appendChild(marketplaceButton)
	}

	function openMarketplacePage(object) {
		const productId = object.product_id
		const marketplaceUrl = `https://www.kogama.com/marketplace/avatar/${productId}/`
		window.open(marketplaceUrl, "_blank")
	}

	function getBaseUrl(url) {
		return url ? url.split("?")[0] : ""
	}

	function rescanAvatars() {
		const avatars = document.querySelectorAll(
			".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2 .MuiGrid-item",
		)

		avatars.forEach(avatar => {
			addButtonsToAvatar(avatar)
		})
	}

	function showModal(results) {
		const overlay = document.createElement("div")
		overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        `
		overlay.addEventListener("click", () => {
			modal.remove()
			overlay.remove()
		})

		const modal = document.createElement("div")
		modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.9);
            color: #fff;
            border-radius: 10px;
            z-index: 9999;
            width: 80%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        `

		results.forEach(result => {
			const resultDiv = document.createElement("div")
			resultDiv.style.cssText = `
                width: calc(50% - 10px); /* Two columns with gap */
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
            `

			const avatarImg = document.createElement("img")
			avatarImg.onload = () => {
				avatarImg.style.opacity = "1"
			}
			avatarImg.onerror = error => {
				console.error("Error loading image:", error)
			}
			avatarImg.src = result.image_large
			avatarImg.style.cssText = `
                width: 100%;
                height: auto;
                opacity: 0; /* Initially hide image to show once loaded */
                transition: opacity 0.3s ease-in-out;
            `

			const avatarLink = document.createElement("a")
			avatarLink.href = `https://www.kogama.com/marketplace/avatar/${result.product_id}/`
			avatarLink.textContent = result.name
			avatarLink.style.cssText = `
                position: absolute;
                font-size: 30px;k
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #fff;
                text-shadow: 0 0 4px #fff;
                text-decoration: none;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            `

			resultDiv.addEventListener("mouseenter", () => {
				avatarImg.style.filter = "blur(7px)"
				avatarLink.style.opacity = "1"
			})

			resultDiv.addEventListener("mouseleave", () => {
				avatarImg.style.filter = "none"
				avatarLink.style.opacity = "0"
			})

			resultDiv.appendChild(avatarImg)
			resultDiv.appendChild(avatarLink)

			modal.appendChild(resultDiv)
		})

		document.body.appendChild(overlay)
		document.body.appendChild(modal)
	}

	window.addEventListener("load", function () {
		setTimeout(function () {
			rescanAvatars()

			setInterval(function () {
				const missingButtons = document.querySelectorAll(
					".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2 .MuiGrid-item:not(:has(.marketplace-button))",
				)
				if (missingButtons.length > 0) {
					rescanAvatars()
				}
			}, 5000)
		}, 2000)
	})
})()
;(function() {
    "use strict";

    GM_addStyle(`
        .menu-label {
            display: inline-flex;
            align-items: center;
            color: #e8e8e8;
            cursor: pointer;
            font-weight: 400;
            margin-top: 16px;
            margin-left: 6px;
            position: relative;
        }
        .menu-label::after {
            content: '';
            display: inline-block;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #e8e8e8;
            margin-left: 5px;
            vertical-align: middle;
        }
        .expanded-menu {
            position: absolute;
            background-color: #f5f0f8;
            padding: 10px;
            border-radius: 5px;
            display: none;
            z-index: 9999;
            transition: max-height 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .expanded-menu.show {
            display: block;
            max-height: 200px;
            overflow-y: auto;
            opacity: 1;
        }
        .expanded-menu button {
            display: block;
            background-color: transparent;
            border: none;
            color: #333;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .expanded-menu button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        .features-page {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
    background-color: rgba(0, 0, 0, 0.6); /* Darker, more opaque background */
            color: #fff;
            backdrop-filter: blur(8px);
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            z-index: 10000;
            text-align: left;
        }
        .features-page h1 {
            color: #ff69b4;
            margin-bottom: 20px;
        }
        .features-page p {
            margin: 10px 0;
        }
        .features-page button.close {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #ff69b4;
            color: #fff;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        .features-page button.close:hover {
            background-color: #ff1493;
        }
        .features-page ufc {
            color: #ff69b4;
            font-weight: bold;
        }
        .features-page c {
            color: #fff;
            text-shadow: 0 0 2px #fff;
            border-radius: 8px;
            padding: 2px 4px;
            font-family: monospace;
            display: inline;
        }
    `);

    var menuLabel = document.createElement("div");
    menuLabel.className = "menu-label";
    menuLabel.textContent = "Utilify";

    var header = document.querySelector("#pageheader > .pageheader-inner");

    if (header) {
        header.appendChild(menuLabel);

        var expandedMenu = document.createElement("div");
        expandedMenu.className = "expanded-menu";

        var menuButtons = document.createElement("div");
        menuButtons.className = "menu-buttons";

        var gradientButton = document.createElement("button");
        gradientButton.textContent = "Adjust Gradient";
        gradientButton.addEventListener("click", function() {
            window.location.href = window.location.href + "/gradient";
        });

        var autoblockingButton = document.createElement("button");
        autoblockingButton.textContent = "Blocking Tool";
        autoblockingButton.addEventListener("click", function() {
            window.location.href = window.location.href + "/autoblocking";
        });

        var masspurchaseButton = document.createElement("button");
        masspurchaseButton.textContent = "Marketplace Tool";
        masspurchaseButton.addEventListener("click", function() {
            window.location.href = window.location.href + "/masspurchase";
        });

        var settingsButton = document.createElement("button");
        settingsButton.textContent = "General Config";
        settingsButton.addEventListener("click", function() {
            window.location.href = window.location.href + "/config";
        });

        var featuresButton = document.createElement("button");
        featuresButton.textContent = "Features";
        featuresButton.addEventListener("click", function() {
            document.querySelector(".features-page").style.display = "block";
        });

        menuButtons.appendChild(gradientButton);
        menuButtons.appendChild(masspurchaseButton);
        menuButtons.appendChild(autoblockingButton);
        menuButtons.appendChild(settingsButton);
        menuButtons.appendChild(featuresButton);

        expandedMenu.appendChild(menuButtons);
        header.appendChild(expandedMenu);

        menuLabel.addEventListener("mouseenter", function() {
            var labelRect = menuLabel.getBoundingClientRect();
            var headerRect = header.getBoundingClientRect();
            expandedMenu.style.left = labelRect.left - headerRect.left + "px";
            expandedMenu.style.top = labelRect.bottom - headerRect.top + 10 + "px";
            expandedMenu.classList.add("show");
        });

        expandedMenu.addEventListener("mouseleave", function() {
            expandedMenu.classList.remove("show");
        });
    } else {
        console.error("Header element not found!");
    }
    var featuresPage = document.createElement("div");
    featuresPage.className = "features-page";
    featuresPage.innerHTML = `
        <button class="close">Close</button>
        <h1>Features</h1>
        <p>
            Here are some of the features available:
            <br><br>
            <ufc>Allow Paste:</ufc> Brings back the feature to copy and paste everywhere.
            <br><br>
            <ufc>Auto Blocking:</ufc> Helps to efficiently block users.
            <br><br>
            <ufc>Auto Badge Redeem:</ufc> Redeem available badges with just a click of a button.
            <br><br>
            <ufc>Better Titles:</ufc> Cozier and compact page titles.
            <br><br>
            <ufc>Compact Menu:</ufc> A way cozier and easier to navigate navbar.
            <br><br>
            <ufc>Console Warning:</ufc> Be careful what you paste into it.
            <br><br>
            <ufc>Display Notification for direct messages:</ufc> Allows you to view direct messages in a system tray notification in a KoGaMaBuddy style.
            <br><br>
            <ufc>Edit Website Gradient:</ufc> Let's you style the website in your own unique gradient.
            <br><br>
            <ufc>Fast Friendslist:</ufc> Allows you to go through any friends list at light speed.
            <br><br>
            <ufc>Filter friends bar:</ufc> Allows you to find & message people faster.
            <br><br>
            <ufc>Find User Avatars:</ufc> (Requested by IDEALISM.) Tries to look for a specific avatar someone may have from their bought avatars.
            <br><br>
            <ufc>Fix ThisHTML:</ufc> Fixes a lot of description-based issues related to symbols like: > \ and so on.
            <br><br>
            <ufc>Get Image Strokes Away:</ufc> Gives a lot of avatar preview transparent background.
            <br><br>
            <ufc>KoGaMaBuddy emojis:</ufc> Brings back KoGaMaBuddy emojis. <br> Start with typing out <c>:</c> and the list will appear.
            <br><br>
            <ufc>Preview Marketplace Images:</ufc> Allows you to view a bigger preview of the object from a marketplace.
            <br><br>
            <ufc>Privacy Blur:</ufc> Allows you to blur possibly sensitive content such as certain inputs, descriptions, etc.
            <br><br>
            <ufc>Recent Activity:</ufc> (4Snowy) Let's you spy on when a certain user was last active.
            <br><br>
            <ufc>RichText:</ufc> Appends a lot of markdown tricks.
            <br><br>
            <ufc>Search Projects:</ufc> Allows you to quickly look through your projects.
            <br><br>
            <ufc>Steal Description:</ufc> Swiftly steal any description, makes it way easier to edit and 'take inspiration' from others.
            <br><br>
            <ufc>User Backgrounds:</ufc> KoGaMaBuddy user-profile backgrounds for profile. Now with custom filters and up to 3 at once, example usage:<br><br>
            <c> Background: 54321, filter:dark,aurora,starlight; </c><br><br>
            <c> Background: 54321, filter:blur,rain; </c>
            <br><br>
            <ufc>User Gradients:</ufc> similar to UserBackgrounds, this lets you set a global gradient for your profile by adding gradient data to your description: <br><br>
            <c>linear-gradient(17deg, #0a0a05, #632812 87%)</c>
            <br><br>
            <ufc>User banner:</ufc> Way more compact KoGaMaBuddy's banners for profiles, view usage here: <br><br>
            <c>banner: "BANNER_CONTENT", #HEX_COLOR;</c><br><br>
            Preview these user-profile features on this profile: profile/670185677/
            <br><br>
            <ufc>View CommentDate:</ufc> (4Snowy) Allows you to view when a comment was written / posted.
            <br><br>
            <ufc>ViewFeed:</ufc> (4Snowy) KoGaMaBuddy's feed viewer in a different format.
            <br><br>
            <ufc>ViewDMLog:</ufc> Allows you to export message log of direct chats (dms).
            <br><br>
        </p>
    `;
    document.body.appendChild(featuresPage);
    document.querySelector(".features-page .close").addEventListener("click", function() {
        featuresPage.style.display = "none";
    });

})();
(function() {
    'use strict';
    const contributorArray = {
        '17769289': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_7d305bca6cf371df98c059f9d2ef05e4.png'], // CREATOR PROFILE
        '670185677': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_5087f7f988bd1b2819cac3e33d0150f5.png'], // DEBUG
        '670193135': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_b63917c64ad44020d2d5877a4f91907f.png'], // S
        '50117938': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_d9ff5ff133ed9176895a4a2b5e58f1b8.png'], // R
        '668318153': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_eb003dc2b5c6d85c8e18cc9336fcdad3.png'], // SR
        '20998101': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_c3cffc19e9784f7d0b005eecdf1b566e.png'], // RR
        '17506905': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_d9ff5ff133ed9176895a4a2b5e58f1b8.png'], // F
        '36355': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_c3cffc19e9784f7d0b005eecdf1b566e.png'], // AW
        '17660398': ['contributor', 'https://cdn.discordapp.com/avatar-decoration-presets/a_d9ff5ff133ed9176895a4a2b5e58f1b8.png'], //  T
        '17037147': ['', 'https://cdn.discordapp.com/avatar-decoration-presets/a_48b8411feb1e80a69048fc65b3275b75.png'] // A
    };

    function addBadgeAndDecoration() {
        const userId = window.location.pathname.split('/')[2];

        if (contributorArray[userId]) {
            const [badgeType, decorationLink] = contributorArray[userId];
            const observer = new MutationObserver((mutations) => {
                const profileStatsContainer = document.querySelector('div._2O_AH');

                if (profileStatsContainer) {
                    const badgesContainer = document.createElement('div');
                    badgesContainer.className = 'utilify-badges';

                    const badge = document.createElement('img');
                    badge.style.width = '32px';
                    badge.style.height = '32px';
                    badge.style.marginRight = '10px';
                    badge.style.verticalAlign = 'middle';
                    if (badgeType === 'contributor') {
                        badge.src = 'https://i.imgur.com/36hp1pm.gif';
                        badge.title = 'Official Utilify Contributor. Thank you for your help ♡';
                    }
                    badgesContainer.appendChild(badge);
                    profileStatsContainer.parentNode.insertBefore(badgesContainer, profileStatsContainer.nextSibling);
                    const profileElement = document.querySelector('div._2bUqU');
                    if (profileElement) {
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = `
                            .UA3TP._2bUqU[style*="transform: none"]::before {
                                content: '';
                                width: 40px;
                                height: 40px;
                                background: url('${decorationLink}') center/cover;
                                transform: translate(-4px, -2px);
                                z-index: 99999;
                                position: absolute;
                                pointer-events: none;
                            }
                        `;
                        document.head.appendChild(styleTag);
                    }

                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    addBadgeAndDecoration();
})()
;(function() {
    "use strict";

    if (window.location.href.endsWith("/autoblocking")) {
        const style = document.createElement('style');
        style.textContent = `
            .dark-glass {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999;
                border-radius: 21px;
            }
            .modal-content {
                background: rgba(0, 0, 0, 0.8);
                padding: 20px;
                border-radius: 21px;
                width: 300px;
                text-align: center;
            }
            .modal-content input {
                margin-bottom: 10px;
                width: calc(100% - 40px);
                padding: 8px;
                border: none;
                border-radius: 5px;
            }
            .modal-content button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            .modal-content button:hover {
                background-color: #45a049;
            }
            .modal-content select {
                width: calc(50% - 10px);
                padding: 8px;
                border: none;
                border-radius: 5px;
            }
            .modal-content .apply-btn {
                width: calc(50% - 10px);
            }
            .blocking-status {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                text-align: center;
                z-index: 999;
            }
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                background-color: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px 20px;
                border-radius: 5px;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);

        var darkGlass = document.createElement("div");
        darkGlass.className = "dark-glass";

        var modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        var selfIdInput = document.createElement("input");
        selfIdInput.placeholder = "SELFID";

        var usersToBlockInput = document.createElement("input");
        usersToBlockInput.placeholder = "USERSTOBLOCK";

        var presetDropdown = document.createElement("select");
        presetDropdown.innerHTML =
            '<option value="">Select Preset</option>' +
            '<option value="null">NULL</option>' +
            '<option value="peaceful">Peaceful</option>' +
            '<option value="furtherpeace">Further Peace</option>';

        presetDropdown.addEventListener("change", function() {
            if (presetDropdown.value === "peaceful") {
                usersToBlockInput.value =
                    "34445, 1186442, 2416361, 2814866, 3375976, 5037938, 8339104, 9019571, 9839184, 10183579, 10497951, 15386532, 15546142, 16154001, 16324315, 18365116, 18515594, 19222931, 19531003, 20037522, 20107599, 21232073, 21269335, 22535591, 23142079, 23213484, 23323453, 24243477, 24304847, 24388642, 25037907, 25227903, 25453113, 50156316, 50417643, 50596580, 50709102, 50980597, 51053955, 51597483, 51605152, 666676920, 667204078, 667315982, 667411050, 667414035, 667630286, 667633711, 667635238, 667767029, 667789126, 667834566, 668064310, 668124616, 668156150, 668287717, 668303247, 668332488, 668923437, 669107441, 669128099, 669333877, 669358563, 669537156, 669604901, 669605680, 669650523, 669696966, 669730391";
            } else if (presetDropdown.value === "null") {
                usersToBlockInput.value = "";
            } else if (presetDropdown.value === "furtherpeace") {
                usersToBlockInput.value =
                    "6141, 34445, 1186442, 2416361, 2814866, 3375976, 5037938, 8339104, 9019571, 9839184, 9852276, 10183579, 10497951, 15386532, 15546142, 16154001, 16324315, 18365116, 18515594, 19222931, 19531003, 20037522, 20107599, 20570568, 21232073, 21269335, 22535591, 23142079, 23213484, 23323453, 24243477, 24304847, 24388642, 25037907, 25227903, 25453113, 50156316, 50417643, 50453248, 50596580, 50709102, 50980597, 51053955, 51597483, 51605152, 666676920, 667204078, 667315982, 667411050, 667414035, 667630286, 667633711, 667635238, 667767029, 667789126, 667834566, 668064310, 668124616, 668156150, 668287717, 668291112, 668303247, 668332488, 668923437, 669082985, 669107441, 669128099, 669203174, 669222295, 669283759, 669303784, 669333877, 669358563, 669448523, 669484907, 669537156, 669586281, 669590528, 669604901, 669605680, 669650523, 669696966, 669730391, 669779395, 669942558, 670017695, 670019951";
            }
        });

        var applyButton = document.createElement("button");
        applyButton.textContent = "Apply";
        applyButton.className = "apply-btn";
        applyButton.addEventListener("click", function() {
            var selfId = selfIdInput.value.trim();
            var usersToBlock = usersToBlockInput.value.trim().split(/\s*,\s*|\s+/);
            blockUsersWithDelay(selfId, usersToBlock);
        });

        modalContent.appendChild(selfIdInput);
        modalContent.appendChild(usersToBlockInput);
        modalContent.appendChild(presetDropdown);
        modalContent.appendChild(applyButton);

        darkGlass.appendChild(modalContent);
        document.body.appendChild(darkGlass);
    }

    async function blockUsersWithDelay(selfId, usersToBlock) {
        const delayBetweenRequests = 600;
        const retryDelay = 1000;
        showNotification("Blocking users...");

        for (const userId of usersToBlock) {
            await blockUserWithRetry(selfId, userId, delayBetweenRequests, retryDelay);
            updateNotification(
                `User <a href="https://www.kogama.com/profile/${userId}">${userId}</a> has been blocked.`
            );
        }

        showNotification("All users have been blocked.");
        setTimeout(function() {
            var notification = document.querySelector(".notification");
            if (notification) {
                notification.remove();
            }
        }, 5000);
    }

    async function blockUserWithRetry(selfId, userId, delay, retryDelay) {
        try {
            await blockUserWithDelay(selfId, userId, delay);
        } catch (error) {
            if (error !== 500) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                await blockUserWithDelay(selfId, userId, delay);
            }
        }
    }

    async function blockUserWithDelay(selfId, profileId, delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const response = await fetch(`/user/${selfId}/block/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-Csrf-Token": "",
            },
            body: JSON.stringify({
                profile_id: profileId,
            }),
        });

        if (!response.ok) {
            throw response.status;
        }
    }

    function showNotification(message) {
        var notification = document.createElement("div");
        notification.className = "notification";
        notification.innerHTML = message;
        document.body.appendChild(notification);

        var notifications = document.querySelectorAll(".notification");
        var totalHeight = 0;
        notifications.forEach(function(item) {
            totalHeight += item.offsetHeight;
        });

        notification.style.top = totalHeight + 20 + "px";
    }

    function updateNotification(message) {
        var notification = document.querySelector(".notification");
        if (notification) {
            notification.innerHTML = message;
        }
    }

    var blockingStatus = document.createElement("div");
    blockingStatus.className = "blocking-status";
    document.body.appendChild(blockingStatus);
})();
;(function () {
	"use strict"

	function checkIfElementExists(selector, callback) {
		const element = document.querySelector(selector)
		if (element) {
			callback(element)
		} else {
			setTimeout(() => checkIfElementExists(selector, callback), 100)
		}
	}

	function addSearchBar(targetDiv) {
		if (!document.querySelector("#kogamaSearchBar")) {
			const searchBar = document.createElement("input")
			searchBar.id = "kogamaSearchBar"
			searchBar.type = "text"
			searchBar.placeholder = "Filter friends..."
			searchBar.style.width = "calc(100% - 16px)"
			searchBar.style.padding = "8px"
			searchBar.style.marginBottom = "10px"
			searchBar.style.height = "30px"
			searchBar.style.backgroundColor = "#363635"
			searchBar.style.color = "#fff"
			searchBar.style.boxSizing = "border-box"
			searchBar.style.position = "relative"
			searchBar.style.zIndex = "9999"

			targetDiv.insertBefore(searchBar, targetDiv.firstChild)
		}
	}

	function filterElements() {
		const searchQuery = document
			.querySelector("#kogamaSearchBar")
			.value.toLowerCase()
		const items = document.querySelectorAll("div._1lvYU")

		items.forEach(item => {
			const nameElement = item.querySelector("div._3zDi-")
			if (nameElement) {
				const nameText = nameElement.textContent.toLowerCase()
				item.style.display = nameText.includes(searchQuery) ? "" : "none"
			}
		})
	}

	function init() {
		checkIfElementExists("div._6cutH", targetDiv => {
			checkIfElementExists("div._1lvYU", () => {
				addSearchBar(targetDiv)
				document
					.querySelector("#kogamaSearchBar")
					?.addEventListener("input", filterElements)
			})
		})
	}

	window.addEventListener("load", init)
})()
;(function() {
    'use strict';
    GM_addStyle(`
        .ubhelper {
            position: absolute;
            background: #333;
            color: #fff;
            border-radius: 4px;
            padding: 5px;
            font-size: 12px;
            display: none;
            z-index: 9999;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
    `);
    const ubhelper = document.createElement('div');
    ubhelper.className = 'ubhelper';
    document.body.appendChild(ubhelper);
    const filters = [
        'haze',
        'starlight',
        'aurora',
        'firefly',
        'snow',
        'rain',
        'meteorshower',
        'blur',
        'dark',
        'light'
    ];
    function showUBHelper(event) {
        const textarea = event.target;

        if (textarea.tagName.toLowerCase() !== 'textarea' && textarea.tagName.toLowerCase() !== 'input') {
            return;
        }

        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        const rect = textarea.getBoundingClientRect();
        const cursorOffset = getCursorOffset(textarea, cursorPos);
        const x = rect.left + cursorOffset.x;
        const y = rect.top + cursorOffset.y + 20;
        const backgroundIndex = value.lastIndexOf('background:', cursorPos);
        const filterIndex = value.lastIndexOf('filter:', cursorPos);

        if (backgroundIndex !== -1 && (backgroundIndex > filterIndex || filterIndex === -1)) {
            showUBHelperAt('Provide Game ID', x, y);
        } else if (filterIndex !== -1) {
            const filtersList = getFiltersList(value, cursorPos);
            showUBHelperAt('Available Filters: ' + filtersList, x, y);
        } else {
            ubhelper.style.display = 'none';
        }
    }
    function getCursorOffset(textarea, cursorPos) {
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.style.font = window.getComputedStyle(textarea).font;
        span.textContent = textarea.value.substr(0, cursorPos);

        document.body.appendChild(span);
        const lineWidth = span.offsetWidth;
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);
        document.body.removeChild(span);

        return {
            x: lineWidth,
            y: lineHeight
        };
    }
    function getFiltersList(value, cursorPos) {
        const filtersPattern = /filter:\s*([a-z,]*)/i;
        const match = filtersPattern.exec(value.substr(0, cursorPos));

        if (match) {
            const usedFilters = match[1].split(',').map(filter => filter.trim()).filter(Boolean);
            const availableFilters = filters.filter(filter => !usedFilters.includes(filter));

            if (usedFilters.length < 3) {
                return availableFilters.join(', ');
            } else {
                return 'No more filters allowed';
            }
        }
        return filters.join(', ');
    }
    function showUBHelperAt(text, x, y) {
        ubhelper.textContent = text;
        ubhelper.style.left = x + 'px';
        ubhelper.style.top = y + 'px';
        ubhelper.style.display = 'block';
    }

    function hideUBHelper() {
        ubhelper.style.display = 'none';
    }
    document.addEventListener('input', showUBHelper);
    document.addEventListener('mousemove', hideUBHelper);
    document.querySelectorAll('textarea, input').forEach(el => {
        el.addEventListener('input', showUBHelper);
    });
})()
;(function() {
    'use strict';
    function waitForElements(selector, callback) {
        const observer = new MutationObserver((mutations) => {
            if (document.querySelectorAll(selector).length > 0) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    GM_addStyle(`
        .password-generator-l1337x {
            position: absolute;
            background: #282a36;
            border: 1px solid #44475a;
            padding: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            display: none;
            z-index: 1000;
            width: 350px; /* Wider menu */
            color: #f8f8f2;
            max-height: 500px; /* Ensuring it doesn't grow too big */
            overflow-y: auto; /* Scroll if needed */
        }
        .password-generator-l1337x.show-l1337x {
            display: block;
        }
        .draggable-l1337x {
            position: fixed;
            cursor: move;
        }
        .draggable-header-l1337x {
            background: #44475a;
            padding: 5px;
            cursor: move;
            font-weight: bold;
            color: #f8f8f2;
            border-bottom: 1px solid #6272a4;
        }
        .draggable-content-l1337x {
            padding: 10px;
        }
        .key-icon-l1337x {
            width: 64px; /* Adjusted size */
            height: 64px; /* Adjusted size */
            cursor: pointer;
            max-width: 64px;
            max-height: 64px;
        }
        .close-btn-l1337x {
            cursor: pointer;
            color: #ff5555;
            float: right;
            font-size: 18px;
        }
        label {
            display: block;
            margin-bottom: 8px;
        }
        input[type="range"].range-l1337x {
            -webkit-appearance: none;
            width: 100%;
            height: 16px;
            background: #44475a;
            outline: none;
            opacity: 0.7;
            transition: opacity .2s;
        }
        input[type="range"].range-l1337x::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #50fa7b;
            border-radius: 50%; /* Circular slider */
            cursor: pointer;
        }
        input[type="range"].range-l1337x::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #50fa7b;
            border-radius: 50%; /* Circular slider */
            cursor: pointer;
        }
        input[type="number"].num-l1337x {
            width: 60px;
            margin: 5px 0;
        }
        button.btn-l1337x {
            background-color: #50fa7b;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
        button.btn-l1337x:hover {
            background-color: #8be9fd;
        }
        #generatedPassword-l1337x {
            margin-top: 10px;
            background: #44475a;
            padding: 5px;
            border-radius: 3px;
            word-break: break-word; /* Break long text */
        }
        input[type="checkbox"].chkbox-l1337x {
            margin-right: 8px;
        }
    `);
    function addPasswordGeneratorUI() {
        const inputs = document.querySelectorAll('input.MuiInputBase-input.MuiFilledInput-input');
        if (inputs.length < 3) return;
        const inputsArray = Array.from(inputs);
        const targetInputs = inputsArray.slice(-2);

        const keyIcon = document.createElement('img');
        keyIcon.src = 'https://i.imgur.com/a17WyRx.png';
        keyIcon.className = 'key-icon-l1337x';
        keyIcon.title = 'Generate Password';
        const generatorDiv = document.createElement('div');
        generatorDiv.className = 'password-generator-l1337x draggable-l1337x';
        generatorDiv.innerHTML = `
            <div class="draggable-header-l1337x">
                Password Generator <span class="close-btn-l1337x">&times;</span>
            </div>
            <div class="draggable-content-l1337x">
                <label><input type="checkbox" id="numCheckbox-l1337x" class="chkbox-l1337x" checked> Include Numbers</label>
                <label><input type="checkbox" id="specialCheckbox-l1337x" class="chkbox-l1337x" checked> Include Special Characters</label>
                <label><input type="checkbox" id="upperCheckbox-l1337x" class="chkbox-l1337x" checked> Include Uppercase Letters</label>
                <label><input type="checkbox" id="lowerCheckbox-l1337x" class="chkbox-l1337x" checked> Include Lowercase Letters</label>
                <label>Length: <input type="range" id="lengthInput-l1337x" class="range-l1337x" min="15" max="74" value="15"></label>
                <input type="number" id="lengthValue-l1337x" class="num-l1337x" min="15" max="74" value="15">
                <button id="copyButton-l1337x" class="btn-l1337x">Copy Password</button>
                <div id="generatedPassword-l1337x"></div>
            </div>
        `;

        document.body.appendChild(generatorDiv);
        document.body.appendChild(keyIcon);

        const secondTargetInput = targetInputs[0];
        const rect = secondTargetInput.getBoundingClientRect();
        keyIcon.style.position = 'absolute';
        keyIcon.style.left = `${rect.right + 10}px`;
        keyIcon.style.top = `${rect.top}px`;

        keyIcon.addEventListener('click', () => {
            generatorDiv.classList.toggle('show-l1337x');
        });

        generatorDiv.querySelector('.close-btn-l1337x').addEventListener('click', () => {
            generatorDiv.classList.remove('show-l1337x');
        });

        dragElement(generatorDiv);

        generatorDiv.querySelector('#lengthInput-l1337x').addEventListener('input', (e) => {
            generatorDiv.querySelector('#lengthValue-l1337x').value = e.target.value;
            generateAndUpdatePassword();
        });

        generatorDiv.querySelector('#lengthValue-l1337x').addEventListener('input', (e) => {
            generatorDiv.querySelector('#lengthInput-l1337x').value = e.target.value;
            generateAndUpdatePassword();
        });

        generatorDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', generateAndUpdatePassword);
        });

        // Copy Password Button
        generatorDiv.querySelector('#copyButton-l1337x').addEventListener('click', () => {
            const passwordText = generatorDiv.querySelector('#generatedPassword-l1337x').textContent;
            if (passwordText) {
                navigator.clipboard.writeText(passwordText).then(() => {
                    alert('Password copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy password: ', err);
                });
            }
        });

        generateAndUpdatePassword();
    }

    function generateAndUpdatePassword() {
        const length = parseInt(document.querySelector('#lengthInput-l1337x').value, 10);
        const includeNumbers = document.querySelector('#numCheckbox-l1337x').checked;
        const includeSpecial = document.querySelector('#specialCheckbox-l1337x').checked;
        const includeUpper = document.querySelector('#upperCheckbox-l1337x').checked;
        const includeLower = document.querySelector('#lowerCheckbox-l1337x').checked;
        const password = generatePassword(length, includeNumbers, includeSpecial, includeUpper, includeLower);
        document.querySelector('#generatedPassword-l1337x').textContent = password;
        updatePasswords(password);
    }

    function generatePassword(length, includeNumbers, includeSpecial, includeUpper, includeLower) {
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';

        let chars = '';
        if (includeNumbers) chars += numberChars;
        if (includeSpecial) chars += specialChars;
        if (includeUpper) chars += upperChars;
        if (includeLower) chars += lowerChars;

        if (chars.length === 0) return '';

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    }

    function updatePasswords(password) {
        const inputs = document.querySelectorAll('input.MuiInputBase-input.MuiFilledInput-input');
        const targetInputs = Array.from(inputs).slice(-2);
        targetInputs.forEach(input => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, password);

            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    function dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.querySelector('.draggable-header-l1337x')) {
            document.querySelector('.draggable-header-l1337x').onmousedown = dragMouseDown;
        } else {
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    waitForElements('input.MuiInputBase-input.MuiFilledInput-input', addPasswordGeneratorUI);
})();

(function() {
    'use strict';
    const restrictedUrls = [
        "https://www.kogama.com/profile/668970496/*",
        "https://www.kogama.com/profile/22217990/*",
        "https://www.kogama.com/profile/670033029/*"
    ];

    function isRestrictedUrl(url) {
        return restrictedUrls.some(restrictedUrl => {
            const regex = new RegExp(restrictedUrl.replace(/\*/g, '.*'));
            return regex.test(url);
        });
    }
    function restrictContent() {
        document.body.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'IBMPlexSerif';
                src: url('https://cdn.jsdelivr.net/gh/IBM/plex@master/packages/plex-serif/fonts/complete/woff2/IBMPlexSerif-Medium.woff2') format('woff2');
                font-weight: 500;
                font-style: normal;
                font-display: swap;
            }
            body {
                background-color: black;
                color: white;
                font-family: 'IBMPlexSerif', serif;
                font-size: 36px;
                text-align: center;
                margin-top: 20%;
            }
        `;
        document.head.appendChild(style);
        const message = document.createElement('div');
        message.textContent = 'CONTENT RESTRICTION';
        document.body.appendChild(message);
    }

    if (isRestrictedUrl(window.location.href)) {
        restrictContent();
    }

})()
;(async () => {
    "use strict";
    function injectModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-dark-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8); /* Darker background */
                display: none;
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            .custom-modal-content {
                background: #333; /* Dark background for modal content */
                padding: 20px;
                border-radius: 10px;
                max-width: 80%;
                max-height: 80%;
                width: 600px;
                height: 400px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
                position: relative;
                overflow: hidden;
                color: #fff; /* White text for contrast */
            }
            .custom-modal-close {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
                font-size: 24px;
                color: #fff; /* White close button */
            }
            .modal-input {
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #555; /* Dark input background */
                border: 1px solid #666;
                color: #fff; /* White text for input */
            }
            .custom-list {
                list-style-type: none;
                padding: 0;
                margin: 0;
                display: grid;
                grid-template-columns: 1fr 1fr; /* Two columns */
                gap: 10px; /* Space between columns */
                height: calc(100% - 80px); /* Height of the list */
                overflow-y: auto; /* Scroll when content overflows */
            }
            .custom-list li {
                background: #444; /* Dark background for list items */
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }
            .custom-list a {
                color: #eee; /* Light text color for links */
                text-decoration: none;
                display: block;
                transition: color 0.3s, text-shadow 0.3s;
            }
            .custom-list a.special-glow {
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.8); /* Soft glow effect */
            }
            .custom-list a:hover {
                color: #fff; /* Brighten on hover */
            }
        `;
        document.head.appendChild(style);
    }

    async function fetchPageData(pageNumber) {
        const url = `https://www.kogama.com/game/?page=${pageNumber}&count=12&filter=all`;
        const response = await fetch(url);
        return response.json();
    }

    function createDarkModeModal() {
        const modal = document.createElement("div");
        modal.id = "customModal";
        modal.className = "custom-dark-modal";
        modal.innerHTML = `
            <div class="custom-modal-content">
                <span class="custom-modal-close">&times;</span>
                <input type="text" id="searchInput" class="modal-input" placeholder="Search...">
                <ul id="elementList" class="custom-list"></ul>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector(".custom-modal-close");
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        modal.querySelector(".custom-modal-content").addEventListener("click", function (event) {
            event.stopPropagation();
        });

        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", function () {
            const searchText = searchInput.value.toLowerCase();
            const listItems = modal.querySelectorAll("#elementList li");
            listItems.forEach(item => {
                const link = item.querySelector("a");
                const itemName = link.textContent.toLowerCase();
                if (itemName.includes(searchText)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }

    function addButton() {
        const parentElement = document.querySelector("div._2UG5l");

        if (!parentElement) {
            console.error("Parent element not found.");
            return;
        }

        const customButton = document.createElement("button");
        customButton.className = "MuiButtonBase-root MuiButton-root MuiButton-text CustomButton";
        customButton.type = "button";
        customButton.textContent = "Search";

        customButton.addEventListener("click", function () {
            const modal = document.getElementById("customModal");
            if (modal) {
                modal.style.display = "flex";
            }
        });

        parentElement.appendChild(customButton);
    }

    function waitForElement() {
        const targetNode = document.querySelector("div._2UG5l");
        if (targetNode) {
            addButton();
            createDarkModeModal();
        } else {
            setTimeout(waitForElement, 2000);
        }
    }

    function checkUrlAndFetchPaginator() {
        if (window.location.href.startsWith("https://www.kogama.com/build/")) {
            return new Promise((resolve) => {
                const maxAttempts = 10;
                let attemptCount = 0;

                const intervalId = setInterval(() => {
                    attemptCount++;
                    const paginator = document.querySelector(
                        "div._2Z6tA nav.MuiPagination-root ul.MuiPagination-ul"
                    );
                    if (paginator) {
                        clearInterval(intervalId);
                        resolve(paginator);
                    } else if (attemptCount >= maxAttempts) {
                        clearInterval(intervalId);
                        resolve(null);
                    }
                }, 2000);
            });
        } else {
            return Promise.resolve(null);
        }
    }

    async function processPageData() {
        const paginator = await checkUrlAndFetchPaginator();

        if (!paginator) {
            console.error("Paginator not found.");
            return;
        }

        const pageButtons = paginator.querySelectorAll('button[aria-label^="Go to page"]');
        let totalPages = 0;

        pageButtons.forEach(button => {
            const pageNum = parseInt(button.textContent.trim(), 10);
            if (!isNaN(pageNum) && pageNum > totalPages) {
                totalPages = pageNum;
            }
        });

        if (totalPages === 0) {
            console.error("Total pages not found.");
            return;
        }

        const elementList = document.getElementById("elementList");
        const userId = getUserIdFromBootstrap();
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        const fetchPromises = [];
        for (let i = 1; i <= totalPages; i++) {
            fetchPromises.push(fetchPageData(i));
        }

        try {
            const pageDataArray = await Promise.all(fetchPromises);
            pageDataArray.forEach(content => {
                content.data.forEach(item => {
                    if (item.id && item.name) {
                        const listItem = document.createElement("li");
                        const link = document.createElement("a");
                        link.textContent = item.name;
                        link.setAttribute("data-object-id", item.id);
                        link.href = generateHref(userId, item.id);
                        link.className = "special-glow";
                        link.target = "_blank";
                        listItem.appendChild(link);
                        elementList.appendChild(listItem);
                    }
                });
            });
        } catch (error) {
            console.error("Error fetching page data:", error);
        }
    }

    function generateHref(userId, objectId) {
        return `https://www.kogama.com/build/${userId}/project/${objectId}/`;
    }

    function updateHrefs(userId) {
        const elementList = document.getElementById("elementList");
        if (!elementList) return;

        const listItems = elementList.querySelectorAll("li");
        listItems.forEach(item => {
            const link = item.querySelector("a");
            if (link) {
                const objectId = link.getAttribute("data-object-id");
                link.href = generateHref(userId, objectId);
            }
        });
    }

    function getUserIdFromBootstrap() {
        const scriptTags = document.getElementsByTagName('script');
        for (let script of scriptTags) {
            const innerContent = script.innerHTML;
            const userMatch = innerContent.match(/"current_user":\s*{.*?"id":\s*(\d+)/);
            if (userMatch && userMatch[1]) {
                return userMatch[1];
            }
        }
        return null;
    }

    injectModalStyles();
    waitForElement();
    processPageData();
})();



;(function () {
	"use strict"

	function runScriptUnderSpecificURLs() {
		const urlPattern = /https:\/\/www.kogama.com\/profile\/\w+\/friends\//
		if (!urlPattern.test(window.location.href)) {
			return
		}

		function getProfileID() {
			const url = window.location.href
			const regex = /https:\/\/www.kogama.com\/profile\/(\w+)\/friends\//
			const match = url.match(regex)

			if (match && match[1]) {
				return match[1]
			}

			return null
		}

		function storeProfileID() {
			const profileID = getProfileID()

			if (profileID) {
				localStorage.setItem("kogamaProfileID", profileID)
			} else {
				console.error("Unable to retrieve Profile ID from the URL.")
			}
		}

		async function fetchAndAppendFriends() {
			const profileID = localStorage.getItem("kogamaProfileID")
			if (!profileID) {
				console.error("Profile ID not found in local storage.")
				return
			}

			const friendsURL = `https://www.kogama.com/user/${profileID}/friend/?count=555`

			try {
				const response = await fetch(friendsURL)
				const data = await response.json()

				const friendsList = data.data.filter(
					friend => friend.friend_status === "accepted",
				)
				const friendsColumn = document.querySelector("#friendsList")

				if (!friendsColumn) {
					console.error("Friends list container not found.")
					return
				}

				friendsList.forEach((friend, index) => {
					const friendLink = document.createElement("a")
					friendLink.href = `https://www.kogama.com/profile/${friend.friend_profile_id}/`
					friendLink.textContent = friend.friend_username
					friendLink.classList.add("friend-entry")
					friendLink.id = `friend-${index}`

					friendsColumn.appendChild(friendLink)
					friendsColumn.appendChild(document.createTextNode(", "))
				})
			} catch (error) {
				console.error("Error fetching Friendslist:", error)
			}
		}

		async function fetchAndAppendRequests() {
			const profileID = localStorage.getItem("kogamaProfileID")
			if (!profileID) {
				console.error("Profile ID not found in local storage.")
				return
			}

			const requestsURL = `https://www.kogama.com/user/${profileID}/friend/requests/?page=1&count=1000`

			try {
				const response = await fetch(requestsURL, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				})

				const responseData = await response.json()

				const sentRequests = []
				const invitingRequests = []

				responseData.data.forEach((request, index) => {
					if (request.profile_id === parseInt(profileID)) {
						sentRequests.push({
							id: request.id,
							friend_status: request.friend_status,
							friend_profile_id: request.friend_profile_id,
							friend_username: request.friend_username,
							index: index,
						})
					} else {
						invitingRequests.push({
							profile_id: request.profile_id,
							profile_username: request.profile_username,
							index: index,
						})
					}
				})

				sentRequests.sort((a, b) =>
					a.friend_username.localeCompare(b.friend_username),
				)

				appendRequestsToList("SENT", sentRequests)
				appendRequestsToList("INVITING", invitingRequests)
			} catch (error) {
				console.error("Error fetching Requests:", error)
			}
		}

		function appendRequestsToList(listType, requests) {
			const listContainer = document.querySelector(
				`#${listType.toLowerCase()}List`,
			)

			if (!listContainer) {
				console.error(`List container not found for ${listType} requests.`)
				return
			}

			requests.forEach(request => {
				const requestLink = document.createElement("a")
				requestLink.classList.add(`${listType.toLowerCase()}-entry`)
				requestLink.id = `${listType.toLowerCase()}-${request.index}`
				if (listType === "INVITING") {
					requestLink.href = `https://www.kogama.com/profile/${request.profile_id}/`
					requestLink.textContent = request.profile_username
				} else {
					requestLink.href = `https://www.kogama.com/profile/${request.friend_profile_id}/`
					requestLink.textContent = request.friend_username
				}

				listContainer.appendChild(requestLink)
				listContainer.appendChild(document.createTextNode(", "))
			})
		}

		function filterEntries() {
			const searchInput = document
				.querySelector("#searchInput")
				.value.toLowerCase()
			const friends = document.querySelectorAll(".friend-entry")
			const inviting = document.querySelectorAll(".inviting-entry")
			const sent = document.querySelectorAll(".sent-entry")

			friends.forEach(friend => {
				if (friend.textContent.toLowerCase().includes(searchInput)) {
					friend.style.display = ""
				} else {
					friend.style.display = "none"
				}
			})

			inviting.forEach(request => {
				if (request.textContent.toLowerCase().includes(searchInput)) {
					request.style.display = ""
				} else {
					request.style.display = "none"
				}
			})

			sent.forEach(request => {
				if (request.textContent.toLowerCase().includes(searchInput)) {
					request.style.display = ""
				} else {
					request.style.display = "none"
				}
			})

			hideUnnecessaryCommas()
		}
		function hideUnnecessaryCommas() {
			const sections = ["friendsList", "invitingList", "sentList"]

			sections.forEach(sectionId => {
				const section = document.getElementById(sectionId)
				const links = section.querySelectorAll("a")
				const commas = section.childNodes

				let lastVisibleLinkIndex = -1
				commas.forEach((node, index) => {
					if (
						node.nodeType === Node.TEXT_NODE &&
						node.textContent.trim() === ","
					) {
						node.style.display = ""
						if (
							index - 1 > lastVisibleLinkIndex &&
							links[index - 1].style.display === "none"
						) {
							node.style.display = "none"
						} else if (
							index + 1 < commas.length &&
							links[index + 1] &&
							links[index + 1].style.display === "none"
						) {
							node.style.display = "none"
						}
					} else if (
						node.nodeType === Node.ELEMENT_NODE &&
						node.tagName === "A" &&
						node.style.display !== "none"
					) {
						lastVisibleLinkIndex = index
					}
				})
			})
		}
		function appendCustomUI() {
			const profileID = localStorage.getItem("kogamaProfileID")
			if (!profileID) {
				console.error("Profile ID not found in local storage.")
				return
			}

			const customDiv = document.createElement("div")
			customDiv.id = "frlscrape"
			customDiv.style.position = "fixed"
			customDiv.style.top = "50%"
			customDiv.style.left = "50%"
			customDiv.style.transform = "translate(-50%, -50%)"
			customDiv.style.zIndex = "9999"
			customDiv.style.width = "650px"
			customDiv.style.height = "400px"
			customDiv.style.display = "flex"
			customDiv.style.flexDirection = "column"
			customDiv.style.background = "rgba(0, 0, 0, 0.9)"
			customDiv.style.backdropFilter = "blur(21px)"
			customDiv.style.borderRadius = "10px"
			customDiv.style.padding = "10px"
			customDiv.style.color = "#fff"
			customDiv.style.overflowY = "auto"
			customDiv.style.userSelect = "none"

			const searchInput = document.createElement("input")
			searchInput.type = "text"
			searchInput.id = "searchInput"
			searchInput.placeholder = "Looking for somebody?"
			searchInput.style.marginBottom = "10px"
			searchInput.style.backgroundColor = "#2222"
			searchInput.style.color = "#fff"
			searchInput.style.padding = "5px"
			searchInput.addEventListener("input", filterEntries)
			customDiv.appendChild(searchInput)

			const column1 = document.createElement("div")
			column1.id = "friendsList"
			column1.style.flex = "1"
			column1.style.marginBottom = "20px"

			const friendsHeader = document.createElement("h2")
			friendsHeader.textContent = "Friendslist"
			column1.appendChild(friendsHeader)

			customDiv.appendChild(column1)

			const column2 = document.createElement("div")
			column2.id = "invitingList"
			column2.style.flex = "1"

			const invitingHeader = document.createElement("h2")
			invitingHeader.textContent = "INVITING"
			column2.appendChild(invitingHeader)

			customDiv.appendChild(column2)

			const column3 = document.createElement("div")
			column3.id = "sentList"
			column3.style.flex = "1"

			const sentHeader = document.createElement("h2")
			sentHeader.textContent = "SENT"
			column3.appendChild(sentHeader)

			customDiv.appendChild(column3)

			document.body.appendChild(customDiv)

			fetchAndAppendFriends()
			fetchAndAppendRequests()

			document.addEventListener("click", function (event) {
				if (!customDiv.contains(event.target)) {
					customDiv.remove()
				}
			})
		}

		storeProfileID()
		appendCustomUI()
	}

	runScriptUnderSpecificURLs()
})()
;(function () {
	"use strict"

	const emojiArray = {
		":awoo:": "https://i.imgur.com/922iZ3g.png",
		":ayaya:": "https://i.imgur.com/xay8Ihw.png",
		":haah:": "https://i.imgur.com/j7RwTBt.png",
		":haha:": "https://i.imgur.com/gqEk9fL.png",
		":soi_smug:": "https://i.imgur.com/UK212Ao.png",
		":junko_shook:": "https://i.imgur.com/Kg7yn6a.png",
		":block_happy:": "https://i.imgur.com/Uo8ahxn.png",
		":block_stylin:": "https://i.imgur.com/saI7R2F.png",
		":sword_sad:": "https://i.imgur.com/q1mrOpK.png",
		":sword_smirk:": "https://i.imgur.com/CAblXlZ.png",
		":sword_yatta:": "https://i.imgur.com/Z5KAWmB.png",
		":Acerbermad:": "https://i.imgur.com/6TasQhg.gif",
		":Acerberisfine:": "https://i.imgur.com/H2bu8BM.gif",
		":Acerberthink:": "https://i.imgur.com/nL56Iz1.gif",
		":cerbersmug:": "https://i.imgur.com/AWb44VH.png",
		":cerberdum:": "https://i.imgur.com/fV4nHCe.png",
		":cerberded:": "https://i.imgur.com/8Tv4BRn.png",
		":cerbersob:": "https://i.imgur.com/aL5lNnj.png",
		":cerbercosy:": "https://i.imgur.com/yczvmt5.png",
		":cerberpout:": "https://i.imgur.com/sF6APQ1.png",
		":cerberwhot:": "https://i.imgur.com/vGecnjb.png",
		":cerberlove:": "https://i.imgur.com/SEyIO3S.png",
		":cerberlul:": "https://i.imgur.com/ugne7oK.png",
	}

	const emojiPickerDiv = document.createElement("div")
	emojiPickerDiv.id = "emojiPicker"
	emojiPickerDiv.style.position = "fixed"
	emojiPickerDiv.style.background = "#2f3136"
	emojiPickerDiv.style.border = "1px solid #ccc"
	emojiPickerDiv.style.padding = "10px"
	emojiPickerDiv.style.display = "none"
	emojiPickerDiv.style.zIndex = "999999"
	emojiPickerDiv.style.maxHeight = "200px"
	emojiPickerDiv.style.overflowY = "auto"
	document.body.appendChild(emojiPickerDiv)

	function updateEmojiPicker(input) {
		const inputValue = input.value
		emojiPickerDiv.innerHTML = ""
		const filteredEmojis = Object.keys(emojiArray).filter(emoji =>
			emoji.includes(inputValue),
		)
		filteredEmojis.forEach(emoji => {
			const emojiContainer = document.createElement("div")
			emojiContainer.style.display = "flex"
			emojiContainer.style.alignItems = "center"
			emojiContainer.style.marginBottom = "5px"

			const img = document.createElement("img")
			img.src = emojiArray[emoji]
			img.title = emoji.substring(1, emoji.length - 1)
			img.alt = emoji
			img.style.width = "20px"
			img.style.height = "20px"
			img.style.cursor = "pointer"
			img.addEventListener("click", () => {
				const cursorPos = input.selectionStart
				const textBeforeCursor = input.value.substring(0, cursorPos)
				const textAfterCursor = input.value.substring(cursorPos)
				input.value = textBeforeCursor + emoji + textAfterCursor
				emojiPickerDiv.style.display = "none"
				input.focus()
			})
			emojiContainer.appendChild(img)

			const emojiName = document.createElement("span")
			emojiName.textContent = emoji.substring(1, emoji.length - 1)
			emojiName.style.marginLeft = "5px"
			emojiName.style.color = "#ffffff"
			emojiContainer.appendChild(emojiName)

			emojiPickerDiv.appendChild(emojiContainer)
		})

		const inputRect = input.getBoundingClientRect()
		emojiPickerDiv.style.bottom = `${window.innerHeight - inputRect.top}px`
		emojiPickerDiv.style.left = `${inputRect.left}px`
		emojiPickerDiv.style.display = "block"
	}

	function convertEmoji(text, emojiArray) {
		for (let emoji in emojiArray) {
			const regex = new RegExp(
				emoji.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
				"g",
			)
			text = text.replace(
				regex,
				`<img src="${emojiArray[emoji]}" alt="${emoji}" title="${emoji.substring(1, emoji.length - 1)}" style="width: 20px; height: 20px;">`,
			)
		}
		return text
	}

	function scanAndConvert(emojiArray) {
		const elements = document.querySelectorAll("*")
		elements.forEach(element => {
			if (
				element.childNodes.length === 1 &&
				element.childNodes[0].nodeType === 3
			) {
				const originalText = element.innerHTML
				const convertedText = convertEmoji(originalText, emojiArray)
				if (originalText !== convertedText) {
					element.innerHTML = convertedText
				}
			}
		})

		const reactElement = document.querySelector(
			'._1aUa_ [itemprop="description"]',
		)
		if (reactElement) {
			const originalText = reactElement.innerHTML
			const convertedText = convertEmoji(originalText, emojiArray)
			if (originalText !== convertedText) {
				reactElement.innerHTML = convertedText
			}
		}
	}

	setInterval(() => {
		scanAndConvert(emojiArray)
	}, 700)

	document.addEventListener("input", function (event) {
		const input = event.target
		const inputValue = input.value

		if (inputValue.startsWith(":")) {
			updateEmojiPicker(input)
		} else {
			emojiPickerDiv.style.display = "none"
		}
	})

	document.addEventListener("click", function (event) {
		const target = event.target

		if (!target.closest("#emojiPicker") && !target.closest("input")) {
			emojiPickerDiv.style.display = "none"
		}
	})
})()
;(function () {
    "use strict";
    function allowPaste(event) {
        event.stopImmediatePropagation();
        return true;
    }
    document.addEventListener("paste", allowPaste, true);
})()
;(function () {
	"use strict"

	const profileId = window.location.pathname.split("/")[2]
	const requestUrl = `https://www.kogama.com/profile/${profileId}/`

	fetch(requestUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok")
			}
			return response.text()
		})
		.then(data => {
			const createdIndex = data.indexOf('"created":')
			const startIndex = data.indexOf('"', createdIndex + 10) + 1
			const endIndex = data.indexOf('"', startIndex)
			const createdValue = data.substring(startIndex, endIndex)
			const createdDate = new Date(createdValue)
			const formattedDate = `${createdDate.getDate()} ${getMonthName(createdDate.getMonth())} ${createdDate.getFullYear()}, ${createdDate.getHours()}:${padZero(createdDate.getMinutes())}`
			const targetElement = document.querySelector("._1jTCU ._20K92")
			if (targetElement) {
				targetElement.textContent = formattedDate
			} else {
				console.error("Target element not found.")
			}
		})
		.catch(error => {
			console.error("There was a problem with the fetch operation:", error)
		})

	function getMonthName(monthIndex) {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		]
		return months[monthIndex]
	}

	function padZero(num) {
		return num < 10 ? "0" + num : num
	}
})()

;(function () {
	"use strict"

	function appendCustomButton() {
		const customButtonImageUrl = "https://i.imgur.com/vQtwuy7.png"
		const targetElements = document.querySelectorAll("._2neko ._2eW3Y")
		targetElements.forEach(function (targetElement) {
			if (!targetElement.querySelector(".custom-button")) {
				const overlayDiv = document.createElement("div")
				overlayDiv.classList.add("overlay-div")
				overlayDiv.style.position = "absolute"
				overlayDiv.style.top = "0"
				overlayDiv.style.left = "0"
				overlayDiv.style.width = "100%"
				overlayDiv.style.height = "100%"
				overlayDiv.style.zIndex = "9999"
				overlayDiv.style.pointerEvents = "none"

				const customButton = document.createElement("button")
				customButton.classList.add("custom-button")
				customButton.style.position = "absolute"
				customButton.style.top = "2px"
				customButton.style.right = "-5px"
				customButton.style.zIndex = "10000"
				customButton.style.background = "transparent"
				customButton.style.pointerEvents = "auto"
				customButton.innerHTML =
					'<img src="' +
					customButtonImageUrl +
					'" alt="Custom Button" width="32" height="32">'
				customButton.addEventListener("click", function (event) {
					event.preventDefault()
					event.stopPropagation()
					const imgSrc = targetElement.querySelector("img").src
					displayPreview(imgSrc)
				})

				overlayDiv.appendChild(customButton)
				targetElement.appendChild(overlayDiv)
			}
		})
	}

	function displayPreview(imgSrc) {
		const darkLayer = document.createElement("div")
		darkLayer.classList.add("dark-layer")
		darkLayer.style.position = "fixed"
		darkLayer.style.top = "0"
		darkLayer.style.left = "0"
		darkLayer.style.width = "100%"
		darkLayer.style.height = "100%"
		darkLayer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
		darkLayer.style.zIndex = "9998"

		document.body.appendChild(darkLayer)

		const previewContainer = document.createElement("div")
		previewContainer.classList.add("preview-container")
		previewContainer.style.position = "fixed"
		previewContainer.style.top = "50%"
		previewContainer.style.left = "50%"
		previewContainer.style.transform = "translate(-50%, -50%)"
		previewContainer.style.maxWidth = "90%"
		previewContainer.style.maxHeight = "90%"
		previewContainer.style.backgroundColor = "transparent"
		previewContainer.style.zIndex = "9999"
		previewContainer.style.borderRadius = "5px"

		const previewImage = document.createElement("img")
		previewImage.src = imgSrc
		previewImage.style.width = "100%"
		previewImage.style.height = "auto"
		previewImage.style.borderRadius = "5px"

		previewContainer.appendChild(previewImage)

		const buttonsContainer = document.createElement("div")
		buttonsContainer.style.position = "absolute"
		buttonsContainer.style.bottom = "10px"
		buttonsContainer.style.left = "50%"
		buttonsContainer.style.transform = "translateX(-50%)"
		buttonsContainer.style.display = "flex"
		buttonsContainer.style.flexDirection = "column"
		buttonsContainer.style.alignItems = "center"

		const copyLinkButton = document.createElement("button")
		copyLinkButton.textContent = "Copy Link"
		copyLinkButton.style.marginBottom = "10px"
		copyLinkButton.addEventListener("click", function () {
			navigator.clipboard.writeText(imgSrc).then(
				function () {
					alert("Direct link copied to clipboard!")
				},
				function () {
					alert("Failed to copy direct link.")
				},
			)
		})

		const closeButton = document.createElement("button")
		closeButton.textContent = "Close"
		closeButton.addEventListener("click", function () {
			previewContainer.remove()
			darkLayer.remove()
		})

		buttonsContainer.appendChild(copyLinkButton)
		buttonsContainer.appendChild(closeButton)

		previewContainer.appendChild(buttonsContainer)

		document.body.appendChild(previewContainer)
	}

	appendCustomButton()

	setInterval(appendCustomButton, 1100)
})()

;(function () {
    "use strict"

    GM_addStyle(`
        #mobile-page #error-404-page, #mobile-page #error-500-page, #mobile-page #error-disconnected-page { display: none; }
        ._3TORb { background: rgba(0, 0, 0, .14); }
        .MuiPaper-root { background-color: rgba(0, 0, 13, 0.14) !important;
             border-radius: 25px !important; }
        .jycgY ._1S6v0 ._3Wsxf .wXhWi ._23o8J { margin-left: 3px; }
        #mobile-page #profile-page .section-top .section-top-background { background-image: none !important; }
        .background-avatar { background-image: none !important; }
        ::-webkit-scrollbar { width: 1px; }
    `)

    applyGradientToElement(getSavedGradientSettings())

    if (window.location.href.endsWith("/gradient")) {
        const savedGradient = getSavedGradientSettings()
        let currentGradient = savedGradient

        const editorContainer = document.createElement("div")
        editorContainer.id = "gradient-editor"
        editorContainer.style.position = "fixed"
        editorContainer.style.top = "50%"
        editorContainer.style.left = "50%"
        editorContainer.style.transform = "translate(-50%, -50%)"
        editorContainer.style.zIndex = "10000"
        editorContainer.style.background = "rgba(0, 0, 0, 0.4)"
        editorContainer.style.backdropFilter = "blur(5px)"
        editorContainer.style.borderRadius = "13px"
        editorContainer.style.padding = "20px"
        editorContainer.style.boxShadow = "0 0 4px black"
        document.body.appendChild(editorContainer)

        const fixButton = createButton("Fix", fixGradientSettings)
        const copyButton = createButton("Copy Current Gradient", scrapeGradient)
        const startColorInput = createColorInput(
            "#ff0000",
            "Start Color",
            updateGradient,
        )
        const endColorInput = createColorInput(
            "#00ff00",
            "End Color",
            updateGradient,
        )
        const degreeInput = createNumberInput("45", "Angle", updateGradient)
        const lengthInput = createRangeInput("100", "Length", updateGradient)
        const customGradientInput = createTextInput(
            "Your custom gradient...",
            updateCustomGradient,
        )

        editorContainer.appendChild(fixButton)
        editorContainer.appendChild(copyButton)
        editorContainer.appendChild(startColorInput)
        editorContainer.appendChild(endColorInput)
        editorContainer.appendChild(degreeInput)
        editorContainer.appendChild(lengthInput)
        editorContainer.appendChild(customGradientInput)

        if (savedGradient) {
            const [startColor, endColor, degree, length] =
                parseGradient(savedGradient)
            startColorInput.querySelector("input[type=text]").value = startColor
            startColorInput.querySelector("input[type=color]").value = startColor
            endColorInput.querySelector("input[type=text]").value = endColor
            endColorInput.querySelector("input[type=color]").value = endColor
            degreeInput.querySelector("input").value = degree
            lengthInput.querySelector("input").value = length
        }

        function fixGradientSettings() {
            localStorage.removeItem("kogamaGradient")
            window.location.reload()
        }

        function createButton(text, onClick) {
            const button = document.createElement("button")
            button.textContent = text
            button.addEventListener("click", onClick)
            button.style.marginTop = "10px"
            button.style.marginRight = "10px"
            button.style.padding = "5px 10px"
            button.style.borderRadius = "20px"
            button.style.bottom = "8px"
            button.style.position = "relative"
            button.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
            button.style.color = "#fff"
            button.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.2)"
            return button
        }

 function createColorInput(value, label, onChange) {
    const container = createInputContainer(label);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = value;
    colorInput.style.marginRight = "10px";

    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.value = value;
    hexInput.maxLength = 7;
    hexInput.placeholder = "#000000";
    hexInput.style.width = "80px";

    hexInput.addEventListener("input", function () {
        let hexValue = hexInput.value.trim();
        if (!hexValue.startsWith("#")) {
            hexValue = "#" + hexValue;
        }
        if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
            colorInput.value = hexValue;
            onChange();
        }
    });

    colorInput.addEventListener("input", function () {
        hexInput.value = colorInput.value;
        onChange();
    });

    container.appendChild(colorInput);
    container.appendChild(hexInput);

    return container;
}
        function createNumberInput(value, label, onChange) {
            const container = createInputContainer(label)
            const input = document.createElement("input")
            input.type = "number"
            input.value = value
            input.addEventListener("input", onChange)
            container.appendChild(input)
            return container
        }

        function createRangeInput(value, label, onChange) {
            const container = createInputContainer(label)
            const input = document.createElement("input")
            input.type = "range"
            input.min = "0"
            input.max = "100"
            input.value = value
            input.addEventListener("input", onChange)
            container.appendChild(input)
            return container
        }

        function createTextInput(placeholder, onChange) {
            const input = document.createElement("input")
            input.type = "text"
            input.placeholder = placeholder
            input.addEventListener("input", onChange)
            input.style.marginTop = "10px"
            input.style.padding = "5px"
            input.style.borderRadius = "10px"
            input.style.border = "1px solid rgba(255, 255, 255, 0.3)"
            input.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
            input.style.color = "#fff"
            return input
        }

        function updateGradient() {
            const startColor = startColorInput.querySelector("input[type=color]").value
            const endColor = endColorInput.querySelector("input[type=color]").value
            const degree = degreeInput.querySelector("input").value
            const length = lengthInput.querySelector("input").value

            const gradient = `linear-gradient(${degree}deg, ${startColor}, ${endColor} ${length}%)`

            applyGradientToElement(gradient)
            currentGradient = gradient
            saveGradientSettings(gradient)
        }

        function updateCustomGradient() {
            const customGradientValue = customGradientInput.value.trim()
            if (validateGradient(customGradientValue)) {
                applyGradientToElement(customGradientValue)
                currentGradient = customGradientValue
                saveGradientSettings(customGradientValue)
            }
        }

        function scrapeGradient() {
            navigator.clipboard
                .writeText(currentGradient)
                .then(() => alert("Gradient copied to clipboard!"))
                .catch(err => console.error("Failed to copy gradient: ", err))
        }

        function createInputContainer(label) {
            const container = document.createElement("div")
            container.style.marginBottom = "20px"
            container.innerHTML = `<strong>${label}:</strong>`
            return container
        }
    }

    function applyGradientToElement(gradient) {
        const elements = [
            document.querySelector("body#root-page-mobile"),
            ...["spring", "summer", "autumn", "winter", "error"].map(season =>
                document.querySelector(`body#root-page-mobile.${season}`)
            )
        ]

        elements.forEach(el => {
            if (el) {
                el.style.backgroundImage = gradient
            }
        })
    }

    function saveGradientSettings(gradient) {
        localStorage.setItem("kogamaGradient", gradient)
    }

    function getSavedGradientSettings() {
        return localStorage.getItem("kogamaGradient")
    }

    function parseGradient(gradient) {
        const regex = /linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\s+(\d+)%\)/
        const matches = gradient.match(regex)

        if (matches) {
            const [, degree, startColor, endColor, length] = matches
            return [startColor, endColor, degree, length]
        }

        return []
    }

    function validateGradient(gradient) {
        const regex =
            /^linear-gradient\(\d+deg,\s*(#[0-9a-f]{3,6}|rgb\([\d\s,]+\)),\s*(#[0-9a-f]{3,6}|rgb\([\d\s,]+\))\s+\d+%\)$/
        return regex.test(gradient)
    }
})()

;(function () {
	"use strict";

	function addCopyButton() {
		var descriptionDiv = document.querySelector('div[itemprop="description"]');

		if (descriptionDiv) {
			var copyButton = document.createElement("button");
			copyButton.textContent = "Copy Description";
			copyButton.style.display = "block";
			copyButton.style.marginTop = "10px";
			copyButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
			copyButton.style.boxShadow =
				"0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)";
			copyButton.style.backdropFilter = "blur(10px)";
			copyButton.style.borderRadius = "8px";
			copyButton.style.marginBottom = "10px";

			copyButton.addEventListener("mouseenter", function () {
				copyButton.style.transition = "background-color 0.3s ease-in-out";
				copyButton.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
			});

			copyButton.addEventListener("mouseleave", function () {
				copyButton.style.transition = "background-color 0.3s ease-in-out";
				copyButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
			});

			copyButton.addEventListener("click", function () {
				var descriptionText = getDescriptionRawText(descriptionDiv);
				copyToClipboard(descriptionText);
				showCustomNotification("Description copied to clipboard!");
			});

			descriptionDiv.appendChild(copyButton);
		}
	}

	function getDescriptionRawText(descriptionDiv) {
		return descriptionDiv.innerText;  // This captures the raw text content ignoring CSS styles
	}

	function copyToClipboard(text) {
		var tempTextarea = document.createElement("textarea");
		tempTextarea.value = text;
		document.body.appendChild(tempTextarea);
		tempTextarea.select();
		document.execCommand("copy");
		document.body.removeChild(tempTextarea);
	}

	function showCustomNotification(message) {
		var notification = document.createElement("div");
		notification.textContent = message;
		notification.style.position = "fixed";
		notification.style.top = "20px";
		notification.style.left = "50%";
		notification.style.transform = "translateX(-50%)";
		notification.style.padding = "10px";
		notification.style.background = "rgba(0, 0, 0, 0.8)";
		notification.style.color = "#fff";
		notification.style.borderRadius = "5px";
		notification.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";
		notification.style.zIndex = "9999";
		notification.style.transition = "opacity 0.3s ease-in-out";

		document.body.appendChild(notification);

		setTimeout(function () {
			notification.style.opacity = "0";

			setTimeout(function () {
				notification.remove();
			}, 300);
		}, 2000);
	}

	window.addEventListener("load", addCopyButton);
})()

;(function () {
	"use strict"

	function init() {
		const profileId = window.location.pathname.split("/")[2]
		const requestUrl = `https://www.kogama.com/profile/${profileId}/`

		fetch(requestUrl)
			.then(response => {
				if (!response.ok) {
					throw new Error("Network response was not ok")
				}
				return response.text()
			})
			.then(data => {
				const createdIndex = data.indexOf('"created":')
				const startIndex = data.indexOf('"', createdIndex + 10) + 1
				const endIndex = data.indexOf('"', startIndex)
				const createdValue = data.substring(startIndex, endIndex)
				const createdDate = new Date(createdValue)
				const formattedDate = `${createdDate.getDate()} ${getMonthName(createdDate.getMonth())} ${createdDate.getFullYear()}, ${createdDate.getHours()}:${padZero(createdDate.getMinutes())}`
				const targetElement = document.querySelector("._1jTCU ._20K92")
				if (targetElement) {
					targetElement.textContent = formattedDate
				} else {
					console.error("Target element not found.")
				}
			})
			.catch(error => {
				console.error("There was a problem with the fetch operation:", error)
			})
	}

	document.addEventListener("DOMContentLoaded", function () {
		setTimeout(init, 2000)
	})

	function getMonthName(monthIndex) {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		]
		return months[monthIndex]
	}

	function padZero(num) {
		return num < 10 ? "0" + num : num
	}
})()

;(function () {
	"use strict"

	function getUsernameFromTitle() {
		const title = document.title
		const username = title.split(" - ")[0]
		return username
	}

	function getUserIDFromURL() {
		const userIDMatch = window.location.pathname.match(/\/profile\/([^/]+)\//)
		return userIDMatch ? userIDMatch[1] : null
	}

	function getGameInfoFromURL() {
		const gameIDMatch = window.location.pathname.match(
			/\/games\/play\/([^/]+)\//,
		)
		return gameIDMatch ? gameIDMatch[1] : null
	}

	function setDocumentTitle() {
		const path = window.location.pathname

		if (path.startsWith("/profile/")) {
			const username = getUsernameFromTitle()
			const userID = getUserIDFromURL()

			if (username && userID) {
				let newTitle = `${username} (${userID})`

				if (!document.title.includes(`(${userID})`)) {
					document.title = newTitle
				}
			}
		} else if (path.startsWith("/games/")) {
			const gameID = getGameInfoFromURL()

			if (gameID) {
				const title = document.title
				const gameTitle = title.split(" - ")[0].trim()

				if (!document.title.includes(`(${gameID})`)) {
					document.title = `${gameTitle} (${gameID})`
				}
			} else {
				document.title = "Games"
			}
		} else if (path.startsWith("/build/")) {
			const title = document.title
			if (path.split("/").length === 3) {
				document.title = "Build"
			} else {
				const buildTitle = title.split(" - ")[0].trim()
				document.title = buildTitle
			}
		} else if (path.startsWith("/marketplace/avatar/")) {
			const title = document.title
			if (!title.includes("(Avatar)")) {
				document.title = `${title.split(" - ")[0].trim()} (Avatar)`
			}
		} else if (path.startsWith("/marketplace/model/")) {
			const title = document.title
			if (!title.includes("(Model)")) {
				document.title = `${title.split(" - ")[0].trim()} (Model)`
			}
		} else if (path.startsWith("/marketplace/")) {
			const title = document.title

			if (path.split("/").length > 3) {
				document.title = title.split(" - ")[0].trim()
			} else {
				document.title = "Shop"
			}
		} else if (path.startsWith("/news/")) {
			document.title = "News"
		} else if (path.startsWith("/leaderboard/")) {
			document.title = "Leaderboard"
		} else {
			document.title = "KoGaMa"
		}
	}

	setDocumentTitle()

	window.addEventListener("popstate", setDocumentTitle)

	window.addEventListener("load", setDocumentTitle)
})()

{
    setTimeout(() => {
        const ConsoleStyle = Object.freeze({
            HEADING:
                "background-color:#d25858;font-size:70px;font-weight:bold;color:white;",
            NORMAL: "font-size:20px;",
            URGENT: "font-size:25px;font-weight:bold;color:red;",
            INVITE:
                "color: transparent;text-decoration:underline;font-weight:bold;font-size:20px;background: linear-gradient(to bottom, #865cb5, #ff69b4);-webkit-background-clip: text;background-clip: text;",
            ADDITIONAL:
                "color: transparent;text-decoration:underline;font-weight:bold;font-size:20px;background: linear-gradient(to bottom, #ff69b4, #d25858);-webkit-background-clip: text;background-clip: text;"
        })

        console.log("%c Chill, Cowboy! ", ConsoleStyle.HEADING)
        console.log(
            "%c" +
                "If someone told you to copy/paste something here, it's likely you're being scammed.",
            ConsoleStyle.NORMAL,
        )
        console.log(
            "%c" +
                "Pasting anything in here could give attackers access to your KoGaMa account.",
            ConsoleStyle.URGENT,
        )
        console.log(
            "%c" +
                "Unless you know exactly what you're doing, close this window and stay safe.",
            ConsoleStyle.NORMAL,
        )
        console.log(
            "%c" +
                "You might want to consider reporting the user who told you to open it.",
            ConsoleStyle.NORMAL,
        )
        console.log(
            "%c" +
                "If you want to contribute visit - > github.com/opendisease/Utilify",
            ConsoleStyle.INVITE,
        )
        console.log(
            "%c" +
                "Looking for direct help? My discord ID is 970332627221504081'",
            ConsoleStyle.ADDITIONAL,
        )
    }, 2700)
}

;(async function () {
    "use strict";

    const waitForElement = async selector => {
        while (!document.querySelector(selector)) {
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        return document.querySelector(selector);
    };

    const InsertBeforeLoad = async () => {
        try {
            const DESCRIPTION_ELEMENT = await waitForElement(
                "div._9smi2 > div.MuiPaper-root._1rJI8.MuiPaper-rounded > div._1aUa_"
            );
            const DESCRIPTION_TEXT = DESCRIPTION_ELEMENT.textContent;
            const BACKGROUND_AVATAR = document.querySelector("._33DXe");
            const BACKGROUND_SECTION = document.querySelector("._33DXe");
            const BODY_ELEMENT = document.querySelector("body#root-page-mobile");
            const BACKGROUND_REGEXP =
                /(?:\|\|)?Background:\s*(\d+)(?:,\s*filter:\s*([a-z, ]+))?;?(?:\|\|)?/i;
            const GRADIENT_REGEXP =
                /linear-gradient\((?:\d+deg, )?(#[0-9a-fA-F]{6}, #[0-9a-fA-F]{6}(?: \d+%)?)\)/i;
            const match = BACKGROUND_REGEXP.exec(DESCRIPTION_TEXT);
            const gradientMatch = GRADIENT_REGEXP.exec(DESCRIPTION_TEXT);

            if (match && typeof match == "object") {
                const gameId = match[1];
                const filters = (match[2] || "").split(",").map(f => f.trim()).slice(0, 3);
                const imageSrc = await fetchImageSource(gameId);

                BACKGROUND_AVATAR.style.transition = "opacity 0.3s ease-in";
                BACKGROUND_AVATAR.style.opacity = "0";

                BACKGROUND_SECTION.style.transition = "opacity 0.3s ease-in";
                BACKGROUND_SECTION.style.opacity = "0";
                setTimeout(() => {
                    BACKGROUND_AVATAR.style.opacity = "1";
                    BACKGROUND_SECTION.style.opacity = "1";
                }, 1000);

                BACKGROUND_SECTION.style.backgroundImage = `url("${imageSrc}")`;

                // Apply filters
                const filterFunctions = {
                    blur: () => BACKGROUND_SECTION.style.filter = "blur(5px)",
                    none: () => {
                        BACKGROUND_AVATAR.style.opacity = "unset";
                        BACKGROUND_SECTION.style.filter = "none";
                    },
                    dark: () => BACKGROUND_SECTION.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${imageSrc}")`,
                    light: () => BACKGROUND_SECTION.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url("${imageSrc}")`,
                    rain: applyRainEffect,
                    meteorshower: applyMeteorShowerEffect,
                    starlight: applyStarlightEffect,
                    aurora: applyAuroraEffect,
                    firefly: applyFireflyEffect,
                    snow: applySnowEffect,
                    haze: applyHazeEffect
                };

                filters.forEach(filter => {
                    if (filterFunctions[filter]) {
                        filterFunctions[filter]();
                    }
                });
            }

            if (gradientMatch && typeof gradientMatch == "object") {
                const gradient = gradientMatch[0];
                BODY_ELEMENT.setAttribute(
                    "style",
                    `background-image: ${gradient} !important; transition: background-image 0.721s ease-in;`
                );
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    async function fetchImageSource(gameId) {
        try {
            const url = `https://www.kogama.com/games/play/${gameId}/embed`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch. Status: ${response.status}`);
            }
            const htmlText = await response.text();
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlText;
            const inputElement = tempDiv.querySelector("li.large input.pure-input");
            const kogstaticUrl = inputElement.value;

            return kogstaticUrl;
        } catch (error) {
            throw new Error(`Error fetching image source: ${error.message}`);
        }
    }

    function applyRainEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const rainOverlay = document.createElement("div");
                rainOverlay.style.position = "absolute";
                rainOverlay.style.top = "0";
                rainOverlay.style.left = "0";
                rainOverlay.style.width = "100%";
                rainOverlay.style.height = "100%";
                rainOverlay.style.pointerEvents = "none";
                rainOverlay.style.zIndex = "10";
                rainOverlay.style.overflow = "hidden";
                element.appendChild(rainOverlay);
                const numDrops = 100;
                for (let i = 0; i < numDrops; i++) {
                    const drop = document.createElement("div");
                    drop.className = "rain-drop";
                    drop.style.position = "absolute";
                    drop.style.background = "rgba(255, 255, 255, 0.8)";
                    drop.style.width = "3px";
                    drop.style.height = "15px";
                    drop.style.bottom = `${Math.random() * 100}%`;
                    drop.style.left = `${Math.random() * 100}%`;
                    drop.style.animation = `fall ${Math.random() * 1 + 1}s linear infinite`;
                    rainOverlay.appendChild(drop);
                }
                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes fall {
                        to {
                            transform: translateY(100vh);
                        }
                    }
                    .rain-drop {
                        z-index: 10;
                        animation: fall linear infinite;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }

    function applyMeteorShowerEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const meteorOverlay = document.createElement("div");
                meteorOverlay.style.position = "absolute";
                meteorOverlay.style.top = "0";
                meteorOverlay.style.left = "0";
                meteorOverlay.style.width = "100%";
                meteorOverlay.style.height = "100%";
                meteorOverlay.style.pointerEvents = "none";
                meteorOverlay.style.zIndex = "10";
                meteorOverlay.style.overflow = "hidden";
                element.appendChild(meteorOverlay);

                const numMeteors = 80;
                for (let i = 0; i < numMeteors; i++) {
                    const meteor = document.createElement("div");
                    meteor.className = "meteor";
                    meteor.style.position = "absolute";
                    meteor.style.width = "0";
                    meteor.style.height = "0";
                    meteor.style.transformOrigin = "left bottom";
                    meteor.style.animation = `fall ${Math.random() * 4 + 5}s linear infinite`;
                    meteor.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10" height="10">
                            <circle cx="5" cy="5" r="2" fill="${getRandomColor()}"/>
                            <line x1="5" y1="5" x2="5" y2="10" stroke="${getRandomColor()}" stroke-width="1" stroke-opacity="0.6"/>
                        </svg>
                    `;

                    meteor.style.top = `${Math.random() * 100}%`;
                    meteor.style.left = `${Math.random() * 100}%`;
                    meteor.style.opacity = "0.9";
                    meteorOverlay.appendChild(meteor);
                }

                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes fall {
                        from {
                            transform: translate(0, 0) rotate(${Math.random() * 360}deg);
                        }
                        to {
                            transform: translateY(100vh);
                        }
                    }
                    .meteor {
                        z-index: 10;
                        animation: fall linear infinite;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }

    function applyStarlightEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];

        targetElements.forEach(element => {
            if (element) {
                const starlightOverlay = document.createElement("div");
                starlightOverlay.style.position = "absolute";
                starlightOverlay.style.top = "0";
                starlightOverlay.style.left = "0";
                starlightOverlay.style.width = "100%";
                starlightOverlay.style.height = "100%";
                starlightOverlay.style.pointerEvents = "none";
                starlightOverlay.style.zIndex = "2";
                starlightOverlay.style.overflow = "hidden";
                element.appendChild(starlightOverlay);

                const numStars = 200; // Adjust number of stars as needed
                for (let i = 0; i < numStars; i++) {
                    const star = document.createElement("div");
                    star.className = "star";
                    star.style.position = "absolute";
                    star.style.width = "2px";
                    star.style.height = "2px";
                    star.style.backgroundColor = "#fff";
                    star.style.borderRadius = "50%";
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.opacity = Math.random() * 0.5 + 0.5; // Random opacity
                    starlightOverlay.appendChild(star);
                }

                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes twinkle {
                        0% { opacity: 0.5; }
                        50% { opacity: 1; }
                        100% { opacity: 0.5; }
                    }
                    .star {
                        animation: twinkle ${Math.random() * 3 + 2}s infinite ease-in-out;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }



    function applyAuroraEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const auroraOverlay = document.createElement("div");
                auroraOverlay.style.position = "absolute";
                auroraOverlay.style.top = "0";
                auroraOverlay.style.left = "0";
                auroraOverlay.style.width = "100%";
                auroraOverlay.style.height = "100%";
                auroraOverlay.style.pointerEvents = "none";
                auroraOverlay.style.zIndex = "10";
                auroraOverlay.style.overflow = "hidden";
                element.appendChild(auroraOverlay);

                const numAuroras = 10;
                for (let i = 0; i < numAuroras; i++) {
                    const aurora = document.createElement("div");
                    aurora.className = "aurora";
                    aurora.style.position = "absolute";
                    aurora.style.width = "200px";
                    aurora.style.height = "200px";
                    aurora.style.background = `radial-gradient(circle at 50%, ${getRandomColor()}, transparent)`;
                    aurora.style.borderRadius = "50%";
                    aurora.style.top = `${Math.random() * 100}%`;
                    aurora.style.left = `${Math.random() * 100}%`;
                    aurora.style.opacity = Math.random();
                    aurora.style.animation = `move ${Math.random() * 5 + 5}s ease-in-out infinite`;
                    auroraOverlay.appendChild(aurora);
                }

                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes move {
                        from {
                            transform: translateY(0);
                        }
                        to {
                            transform: translateY(100px);
                        }
                    }
                    .aurora {
                        z-index: 10;
                        animation: move ease-in-out infinite;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }
    function applyFireflyEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const fireflyOverlay = document.createElement("div");
                fireflyOverlay.style.position = "absolute";
                fireflyOverlay.style.top = "0";
                fireflyOverlay.style.left = "0";
                fireflyOverlay.style.width = "100%";
                fireflyOverlay.style.height = "100%";
                fireflyOverlay.style.pointerEvents = "none";
                fireflyOverlay.style.zIndex = "10";
                fireflyOverlay.style.overflow = "hidden";
                element.appendChild(fireflyOverlay);

                const numFireflies = 50;
                for (let i = 0; i < numFireflies; i++) {
                    const firefly = document.createElement("div");
                    firefly.className = "firefly";
                    firefly.style.position = "absolute";
                    firefly.style.width = "5px";
                    firefly.style.height = "5px";
                    firefly.style.background = "rgba(255, 255, 0, 0.8)";
                    firefly.style.borderRadius = "50%";
                    firefly.style.top = `${Math.random() * 100}%`;
                    firefly.style.left = `${Math.random() * 100}%`;
                    firefly.style.opacity = Math.random();
                    firefly.style.animation = `blink ${Math.random() * 2 + 1}s ease-in-out infinite`;
                    fireflyOverlay.appendChild(firefly);
                }

                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes blink {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.3;
                        }
                    }
                    .firefly {
                        z-index: 10;
                        animation: blink ease-in-out infinite;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }

    function applySnowEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const snowOverlay = document.createElement("div");
                snowOverlay.style.position = "absolute";
                snowOverlay.style.top = "0";
                snowOverlay.style.left = "0";
                snowOverlay.style.width = "100%";
                snowOverlay.style.height = "100%";
                snowOverlay.style.pointerEvents = "none";
                snowOverlay.style.zIndex = "10";
                snowOverlay.style.overflow = "hidden";
                element.appendChild(snowOverlay);

                const numSnowflakes = 100;
                for (let i = 0; i < numSnowflakes; i++) {
                    const snowflake = document.createElement("div");
                    snowflake.className = "snowflake";
                    snowflake.style.position = "absolute";
                    snowflake.style.background = "rgba(255, 255, 255, 0.8)";
                    snowflake.style.width = `${Math.random() * 3 + 5}px`;
                    snowflake.style.height = snowflake.style.width;
                    snowflake.style.borderRadius = "50%";
                    snowflake.style.top = `${Math.random() * 100}%`;
                    snowflake.style.left = `${Math.random() * 100}%`;
                    snowflake.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
                    snowOverlay.appendChild(snowflake);
                }

                const styleSheet = document.createElement("style");
                styleSheet.type = "text/css";
                styleSheet.innerText = `
                    @keyframes fall {
                        to {
                            transform: translateY(100vh);
                        }
                    }
                    .snowflake {
                        z-index: 10;
                        animation: fall linear infinite;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }
    function applyHazeEffect() {
        const targetElements = [
            document.querySelector("._13UrL ._23KvS"),
            document.querySelector("._13UrL ._23KvS ._33DXe"),
        ];
        targetElements.forEach(element => {
            if (element) {
                const hazeOverlay = document.createElement("div");
                hazeOverlay.style.position = "absolute";
                hazeOverlay.style.top = "0";
                hazeOverlay.style.left = "0";
                hazeOverlay.style.width = "100%";
                hazeOverlay.style.height = "100%";
                hazeOverlay.style.pointerEvents = "none";
                hazeOverlay.style.zIndex = "-1";
                hazeOverlay.style.overflow = "hidden";
                hazeOverlay.style.background = "rgba(33, 33, 33, 0.3)";
                hazeOverlay.style.backdropFilter = "blur(10px)";
                element.appendChild(hazeOverlay);
            }
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    InsertBeforeLoad();
})();

function removeElementsByClass(className) {
	var elements = document.querySelectorAll(className)
	elements.forEach(function (element) {
		element.remove()
	})
}

window.addEventListener("load", function () {
	removeElementsByClass(".news")
	removeElementsByClass(".subscription")
	removeElementsByClass(".purchase")

	var observer = new MutationObserver(function (mutationsList) {
		mutationsList.forEach(function (mutation) {
			if (mutation.type === "childList") {
				removeElementsByClass(".news")
				removeElementsByClass(".subscription")
				removeElementsByClass(".purchase")
			}
		})
	})

	var targetNode = document.body
	var config = { childList: true, subtree: true }

	observer.observe(targetNode, config)
})
const injectCss = (id, css) => {
	const style = document.createElement("style")
	style.id = id
	style.innerText = css
	document.head.appendChild(style)
	return style
}

(function () {
    "use strict";

    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (method === "GET" && /\/chat\/\d+\//.test(url)) {
            this.addEventListener("load", function () {
                if (this.status >= 200 && this.status < 300) {
                    try {
                        const response = JSON.parse(this.responseText);
                        if (response && response.data) {
                            for (const key in response.data) {
                                if (response.data.hasOwnProperty(key)) {
                                    const messages = response.data[key];

                                    if (Array.isArray(messages)) { // Check if it's an array
                                        messages.forEach(message => {
                                            const {
                                                from_profile_id,
                                                from_username,
                                                message: content,
                                            } = message;

                                            const match = url.match(/\/chat\/(\d+)\//);
                                            if (match && match[1] !== from_profile_id) {
                                                showNotification(from_username, content);
                                            }
                                        });
                                    } else {
                                        // You can handle unexpected structures here if needed
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Optionally handle JSON parsing errors here
                    }
                }
            });
        }
        open.apply(this, arguments);
    };

    function showNotification(username, message) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    createNotification(username, message);
                }
            });
        } else {
            createNotification(username, message);
        }
    }

    function createNotification(username, message) {
        const notification = new Notification(`Direct message by: ${username}`, {
            body: message,
            icon: "https://kogama.com/favicon.ico",
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
})()
;(function () {
	"use strict"
	function fixText(text) {
		return text
			.replace(/&amp;#34;/g, '"')
			.replace(/&amp;amp;#34;/g, '"')
			.replace(/&amp;#39;/g, "'")
			.replace(/&amp;amp;#39;/g, "'")
			.replace(/&amp;gt;/g, ">")
			.replace(/&amp;amp;gt;/g, ">")
	}
	function fixInput(input) {
		if (
			input.value.match(
				/&amp;#34;|&amp;amp;#34;|&amp;#39;|&amp;amp;#39;|&amp;gt;|&amp;amp;gt;/,
			)
		) {
			input.value = fixText(input.value)
			input.dispatchEvent(new Event("input", { bubbles: true }))
			input.dispatchEvent(new Event("change", { bubbles: true }))
		}
	}
	function fixAllElements() {
		const inputs = document.querySelectorAll(
			'input[type="text"], input[type="search"], textarea',
		)
		inputs.forEach(input => fixInput(input))

		const textNodes = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
			false,
		)
		let currentNode
		while ((currentNode = textNodes.nextNode())) {
			if (
				currentNode.nodeValue.match(
					/&amp;#34;|&amp;amp;#34;|&amp;#39;|&amp;amp;#39;|&amp;gt;|&amp;amp;gt;/,
				)
			) {
				currentNode.nodeValue = fixText(currentNode.nodeValue)
			}
		}
	}
	window.addEventListener("load", fixAllElements)
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.type === "childList") {
				mutation.addedNodes.forEach(node => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const inputs = node.querySelectorAll(
							'input[type="text"], input[type="search"], textarea',
						)
						inputs.forEach(input => fixInput(input))

						const textNodes = document.createTreeWalker(
							node,
							NodeFilter.SHOW_TEXT,
							null,
							false,
						)
						let currentNode
						while ((currentNode = textNodes.nextNode())) {
							if (
								currentNode.nodeValue.match(
									/&amp;#34;|&amp;amp;#34;|&amp;#39;|&amp;amp;#39;|&amp;gt;|&amp;amp;gt;/,
								)
							) {
								currentNode.nodeValue = fixText(currentNode.nodeValue)
							}
						}
					}
				})
			} else if (
				mutation.type === "characterData" &&
				mutation.target.nodeValue.match(
					/&amp;#34;|&amp;amp;#34;|&amp;#39;|&amp;amp;#39;|&amp;gt;|&amp;amp;gt;/,
				)
			) {
				mutation.target.nodeValue = fixText(mutation.target.nodeValue)
			} else if (
				mutation.type === "attributes" &&
				mutation.target.value &&
				mutation.target.value.match(
					/&amp;#34;|&amp;amp;#34;|&amp;#39;|&amp;amp;#39;|&amp;gt;|&amp;amp;gt;/,
				)
			) {
				fixInput(mutation.target)
			}
		})
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true,
		attributes: true,
	})

	document.body.addEventListener("focusin", event => {
		const target = event.target
		if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
			fixInput(target)
		}
	})

	document.body.addEventListener("input", event => {
		const target = event.target
		if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
			fixInput(target)
		}
	})
})()
;(function() {
    'use strict';
    function updateTitle() {
        const path = window.location.pathname;

        switch (true) {
            case path.endsWith('/config'):
                document.title = 'Utilify Settings';
                break;
            case path.endsWith('/gradient'):
                document.title = 'Gradient Adjustements';
                break;
            case path.endsWith('/masspurchase'):
                document.title = 'Marketplace Tool';
                break;
            case path.endsWith('/autoblocking'):
                document.title = 'User Blocking';
                break;
            default:
                break;
        }
    }
    updateTitle();
})();
(function () {
    "use strict";

    const CONFIG_KEY = "config";
    const FONT_STYLE_ID = "fontStyle";
    const PRESET_FONTS = [
        "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald",
        "Raleway", "Poppins", "Merriweather", "Nunito", "Quicksand",
        "Comfortaa", 'IBMPlexMono'
    ];

    // Check if we're on the config page
    if (window.location.pathname.endsWith('/config')) {
        createConfigMenu();
    } else {
        // Apply settings based on saved config
        applySettingsFromConfig();
    }

    function createConfigMenu() {
        const configMenu = document.createElement("div");
        configMenu.className = "config-menu";
        configMenu.style.cssText = `
            width: 300px;
            height: 400px;
            padding: 20px;
            background: rgba(186, 104, 200, 0.4);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            color: #fff;
            font-family: Arial, sans-serif;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            overflow-y: auto;
        `;

        const privacyCategory = createCategory("Privacy", [
            { label: "Blur Sensitive Content", key: "blurSensitiveContents", callback: applyBlurSetting }
        ]);

        const profilesCategory = createCategory("Profiles", [
            { label: "Disable Hidden Badges", key: "disableHiddenBadges", callback: applyBadgeSettings },
            { label: "Disable All Badges", key: "disableAllBadges", callback: applyBadgeSettings },
            { label: "Hide Friends List", key: "hideFriendsList", callback: applyHideFriendsListSetting }
        ]);

        const fontCategory = createFontCategory();

        configMenu.appendChild(privacyCategory);
        configMenu.appendChild(profilesCategory);
        configMenu.appendChild(fontCategory);

        document.body.appendChild(configMenu);

        // Apply settings from saved config
        applySettingsFromConfig();
    }

    function createCategory(title, settings) {
        const category = document.createElement("div");
        category.className = "config-category";
        category.style.marginBottom = "20px";

        const categoryLabel = document.createElement("div");
        categoryLabel.textContent = title;
        categoryLabel.style.cssText = `
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(186, 104, 200, 0.5);
            padding-bottom: 5px;
        `;
        category.appendChild(categoryLabel);

        settings.forEach(setting => {
            const settingLabel = document.createElement("div");
            settingLabel.textContent = setting.label;
            settingLabel.style.marginBottom = "10px";

            const settingControl = createCheckbox(setting.key, setting.callback);

            category.appendChild(settingLabel);
            category.appendChild(settingControl);
        });

        return category;
    }

    function createCheckbox(key, callback) {
        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "checkbox-container";
        checkboxContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        `;

        const checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        checkboxInput.checked = getConfigValue(key);
        checkboxInput.addEventListener("change", function () {
            const isEnabled = checkboxInput.checked;
            setConfigValue(key, isEnabled);
            callback(isEnabled);
        });

        const checkboxLabel = document.createElement("label");
        checkboxLabel.textContent = key.replace(/([A-Z])/g, " $1").trim();
        checkboxLabel.style.cssText = `
            margin-left: 10px;
            font-size: 14px;
        `;

        checkboxContainer.appendChild(checkboxInput);
        checkboxContainer.appendChild(checkboxLabel);

        return checkboxContainer;
    }

    function createFontCategory() {
        const fontCategory = document.createElement("div");
        fontCategory.className = "config-category";
        fontCategory.style.marginBottom = "20px";

        const categoryLabel = document.createElement("div");
        categoryLabel.textContent = "Font";
        categoryLabel.style.cssText = `
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(186, 104, 200, 0.5);
            padding-bottom: 5px;
        `;
        fontCategory.appendChild(categoryLabel);

        const fontContainer = document.createElement("div");
        fontContainer.className = "font-container";
        fontContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        `;

        const fontLabel = document.createElement("div");
        fontLabel.textContent = "Choose Font:";
        fontLabel.style.marginRight = "10px";

        const fontSelect = document.createElement("select");
        fontSelect.style.cssText = `
            flex: 1;
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #666;
            background-color: #333;
            color: #fff;
            font-family: Arial, sans-serif;
        `;
        PRESET_FONTS.forEach(font => {
            const option = document.createElement("option");
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
        fontSelect.value = getConfigValue("customFont") || "";
        fontSelect.addEventListener("change", function () {
            const fontName = fontSelect.value;
            setConfigValue("customFont", fontName);
            applyFontSetting(fontName);
        });

        fontContainer.appendChild(fontLabel);
        fontContainer.appendChild(fontSelect);

        fontCategory.appendChild(fontContainer);

        return fontCategory;
    }

    function getConfigValue(key) {
        const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
        return config[key] !== undefined ? config[key] : false;
    }

    function setConfigValue(key, value) {
        let config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
        config[key] = value;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    function applySettingsFromConfig() {
        // Ensure settings are applied correctly
        applyBlurSetting(getConfigValue("blurSensitiveContents"));
        applyBadgeSettings();
        applyFontSetting(getConfigValue("customFont"));
        applyHideFriendsListSetting(getConfigValue("hideFriendsList"));
    }

    function applyBadgeSettings() {
        // Check badge settings and apply them
        const disableHiddenBadges = getConfigValue("disableHiddenBadges");
        const disableAllBadges = getConfigValue("disableAllBadges");

        GM_addStyle(`
            ._1EHSt._3qLso {
                display: ${disableHiddenBadges ? 'none' : 'block'} !important;
            }
            ._1z4jM {
                display: ${disableAllBadges ? 'none' : 'block'} !important;
            }
        `);
    }

    function applyBlurSetting(isEnabled) {
        GM_addStyle(`
            .MuiFilledInput-inputMarginDense,
            .MuiSelect-select.MuiSelect-select,
            ._13UrL .kR267 ._9smi2 ._1rJI8 {
                filter: ${isEnabled ? 'blur(5px)' : 'none'};
                transition: filter 0.3s ease;
            }
            .MuiFilledInput-inputMarginDense:hover,
            .MuiSelect-select.MuiSelect-select:hover,
            ._13UrL .kR267 ._9smi2 ._1rJI8:hover,
            .MuiFilledInput-inputMarginDense:active,
            .MuiSelect-select.MuiSelect-select:active,
            ._13UrL .kR267 ._9smi2 ._1rJI8:active {
                filter: none; /* Remove blur on hover and active states */
            }
        `);
    }

    function applyFontSetting(fontName) {
        const existingStyle = document.getElementById(FONT_STYLE_ID);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement("style");
        style.id = FONT_STYLE_ID;

        if (fontName) {
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap');
                * {
                    font-family: '${fontName}', sans-serif !important;
                }
            `;
        } else {
            style.textContent = `
                * {
                    font-family: 'Arial', sans-serif !important;
                }
            `;
        }

        document.head.appendChild(style);
    }

    function applyHideFriendsListSetting(isEnabled) {
        GM_addStyle(`
            ._1Yhgq {
                display: ${isEnabled ? 'none' : 'block'} !important;
                transition: opacity 1.3s ease-in-out;
                opacity: ${isEnabled ? '0' : '1'};
            }
        `);
    }




;(function() {
    'use strict';

    var targetClassNames = ['HkJ09', '_21GhQ', '_2Xkij'];
    var targetIds = ['react-ingame-mini-profile'];
    function containsTargetClasses(element) {
        return targetClassNames.some(className => element.querySelector(`.${className}`));
    }

    function removeParentElements() {
        targetIds.forEach(id => {
            var elem = document.getElementById(id);
            if (elem) {
                elem.remove();
            }
        });

        var parentElements = document.querySelectorAll('div._3i_24');
        parentElements.forEach(parent => {
            if (containsTargetClasses(parent)) {
                parent.remove();
            }
        });
    }
    removeParentElements();
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    targetIds.forEach(id => {
                        if (node.id === id) {
                            node.remove();
                        }
                    });

                    if (containsTargetClasses(node)) {
                        node.remove();
                    } else {
                        node.querySelectorAll('div._3i_24').forEach(parent => {
                            if (containsTargetClasses(parent)) {
                                parent.remove();
                            }
                        });
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
	;(async function () {
		"use strict"

		const waitForElement = async selector => {
			while (!document.querySelector(selector)) {
				await new Promise(resolve => requestAnimationFrame(resolve))
			}
			return document.querySelector(selector)
		}

		const InsertBanner = async () => {
			try {
				const DESCRIPTION_ELEMENT = await waitForElement(
					"div._9smi2 > div.MuiPaper-root._1rJI8.MuiPaper-rounded > div._1aUa_",
				)
				const DESCRIPTION_TEXT = DESCRIPTION_ELEMENT.textContent
				const USERNAME_ELEMENT = await waitForElement("div._2IqY6 > h1")

				const BANNER_REGEXP = /banner:\s*"([^"]+)",\s*#([0-9a-fA-F]{6});/i
				const match = BANNER_REGEXP.exec(DESCRIPTION_TEXT)

				if (match && typeof match == "object") {
					const bannerText = match[1]
					const bannerColor = match[2]

					const lineElement = document.createElement("div")
					lineElement.textContent = "|"
					lineElement.style.color = `#${bannerColor}`
					lineElement.style.fontSize = "0.75em"
					lineElement.style.display = "inline-block"
					lineElement.style.marginRight = "5px"

					const subtitleElement = document.createElement("div")
					subtitleElement.style.display = "flex"
					subtitleElement.style.alignItems = "center"
					subtitleElement.style.marginTop = "1px"
					subtitleElement.style.marginBottom = "10px"

					const subtitleTextElement = document.createElement("div")
					subtitleTextElement.textContent = bannerText
					subtitleTextElement.style.color = `#${bannerColor}`
					subtitleTextElement.style.textShadow =
						"2px 2px 4px rgba(0, 0, 0, 0.3)"
					subtitleTextElement.style.fontWeight = "600"
					subtitleTextElement.style.fontSize = "0.75em"

					subtitleElement.appendChild(lineElement)
					subtitleElement.appendChild(subtitleTextElement)

					USERNAME_ELEMENT.parentElement.insertBefore(
						subtitleElement,
						USERNAME_ELEMENT.nextSibling,
					)
				}
			} catch (error) {
				console.error("Error:", error.message)
			}
		}

		InsertBanner()
	})()

	;(function initialize() {
		const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}
		const badgesConfig = config["badges"] || {}
		const disableHiddenBadges = badgesConfig["disableHiddenBadges"] || false
		applyBadgeSettings("badges", "disableHiddenBadges", disableHiddenBadges)
		const disableAllBadges = badgesConfig["disableAllBadges"] || false
		applyBadgeSettings("badges", "disableAllBadges", disableAllBadges)

		if (window.location.href.endsWith("/config")) {
			createConfigMenu()
		}
	})()

	GM_addStyle(`
        .checkbox-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .checkbox-label {
            flex: 1;
        }

        .checkbox-span {
            margin-left: 10px;
        }

        .switch {
            top: 6px;
            position: relative;
            display: inline-block;
            width: 50px;
            height: 21px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider-round {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }

        .slider-round:before {
            position: absolute;
            content: "";
            height: 21px;
            width: 21px;
            left: 2px;
            bottom: 1px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider-round {
            background-color: #2196F3;
        }

        input:checked + .slider-round:before {
            transform: translateX(26px);
        }

        .config-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            padding: 20px; /* Adjust padding as needed */
            background-color: #333 !important;
            color: white !important;
            border: 1px solid #444;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        }

        .config-category {
            margin-bottom: 15px;
        }
    `)
})()

;(function () {
    "use strict";

    // Function to parse Markdown and apply HTML formatting
    function parseMarkdown(text) {
        const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
        let processedText = text.replace(markdownLinkRegex, function (match, title, url) {
            if (!/^https?:\/\//i.test(url)) {
                url = "http://" + url;
            }
            return `<a href="${url}" target="_blank" class="markdown-link">${title}</a>`;
        });

        const lines = processedText.split("<br>");
        const processedLines = lines.map(line => {
            if (line.startsWith("### ")) {
                return "<h3>" + line.substring(4) + "</h3>";
            } else if (line.startsWith("## ")) {
                return "<h2>" + line.substring(3) + "</h2>";
            } else if (line.startsWith("# ")) {
                return "<h1>" + line.substring(2) + "</h1>";
            }
            line = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
            line = line.replace(/\*(.+?)\*/g, "<i>$1</i>");
            line = line.replace(/__(.+?)__/g, "<u>$1</u>");
            line = line.replace(/~~(.+?)~~/g, "<s>$1</s>");
            line = line.replace(/`(.+?)`/g, '<code style="background-color: #524B49; padding: 2px; border-radius: 3px;">$1</code>');
            line = line.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
            return line;
        });

        return processedLines.join("<br>");
    }

    // Function to handle and format text in an element
    function handleElement(element) {
        if (element.hasAttribute('data-formatted')) return; // Skip already formatted elements

        const originalText = element.innerHTML;
        const processedText = parseMarkdown(originalText);
        element.innerHTML = processedText;
        element.setAttribute('data-formatted', 'true'); // Mark element as formatted

        const style = document.createElement("style");
        style.innerHTML = `
            .spoiler {
                filter: blur(5px);
                border-radius: 3px;
                padding: 0 2px;
                cursor: pointer;
                transition: 0.6s ease-in-out all;
            }
            .spoiler:hover {
                filter: blur(0px);
                transition: 0.6s ease-in-out all;
            }
        `;
        document.head.appendChild(style);

        const links = element.querySelectorAll(".markdown-link");
        links.forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                const url = this.getAttribute("href");
                window.open(url, "_blank");
            });
        });
    }

    // Function to apply formatting to all matching elements
    function applyFormatting() {
        const elements = document.querySelectorAll('._13UrL .kR267 ._9smi2 ._1rJI8 ._1aUa_');
        elements.forEach(handleElement);
    }

    // Create a MutationObserver to observe changes in the DOM
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                applyFormatting(); // Apply formatting to new elements
            }
        });
    });

    // Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial formatting
    applyFormatting();
})();


;(function () {
	"use strict"

	const encodedUID = "MTc3NjkyODk="

	function decodeBase64(encodedStr) {
		return atob(encodedStr)
	}

	function CheckWindow() {
		const profileURL = `https://www.kogama.com/profile/${decodeBase64(encodedUID)}/`
		return window.location.href === profileURL
	}

	function InjectVariety() {
		const css = `
            .UA3TP._2bUqU[style*="transform: none"]::before {
                content: '';
                width: 40px;
                height: 40px;
                background: url("https://i.imgur.com/hfnYocD.png") center/cover;
                transform: translate(-4px, -2px);
                z-index: 99999;
                position: absolute;
                pointer-events: none;
            }
        `
		const style = document.createElement("style")
		style.type = "text/css"
		style.appendChild(document.createTextNode(css))
		document.head.appendChild(style)
	}

	if (CheckWindow()) {
		InjectVariety()
	}
})()

;(function () {
    "use strict";

    const isOnProfilePage = /^https:\/\/www\.kogama\.com\/profile\/\d+\/?$/.test(window.location.href);

    function isMe() {
        const scriptTags = [...document.head.getElementsByTagName("script")];
        const bootstrapScript = scriptTags.find(script => script.textContent.includes("options.bootstrap"));

        if (!bootstrapScript) {
            console.warn("Bootstrap script not found.");
            return false;
        }

        // Extract the options.bootstrap object from the script text
        const bootstrapText = bootstrapScript.textContent;
        const bootstrapObjectMatch = bootstrapText.match(/options\.bootstrap\s*=\s*(\{.*?\});/s);

        if (!bootstrapObjectMatch) {
            console.warn("Bootstrap object not found.");
            return false;
        }

        try {
            // Parse the extracted JSON
            const bootstrapObject = JSON.parse(bootstrapObjectMatch[1]);
            return bootstrapObject.object && bootstrapObject.object.is_me === true;
        } catch (e) {
            console.error("Failed to parse bootstrap object:", e);
            return false;
        }
    }

    if (!isOnProfilePage || !isMe()) return;


    function createElementWithStyle(tag, style) {
        const element = document.createElement(tag);
        Object.assign(element.style, style);
        return element;
    }

    function createButton(id, text, style, onClick) {
        const button = document.createElement("button");
        button.id = id;
        button.textContent = text;
        Object.assign(button.style, style);
        button.addEventListener("click", onClick);
        return button;
    }

    function addFeedReviewButton() {
        const targetDiv = document.querySelector("div._1Noq6");
        if (!targetDiv || document.getElementById("feedReviewButton")) return;

        const buttonStyle = {
            fontSize: "14px",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            position: "absolute",
            top: "50%",
            right: "100%",
            backgroundColor: "transparent",
            transform: "translateY(-50%)",
            zIndex: "10000",
            textShadow: "0 0 4px #fff",
            fontFamily: "Comfortaa, sans-serif",
        };

        const feedButton = createButton("feedReviewButton", "FEED", buttonStyle, fetchAndDisplayFeeds);
        targetDiv.appendChild(feedButton);
    }

    function waitForTargetDiv() {
        const interval = setInterval(() => {
            if (document.querySelector("div._1Noq6")) {
                clearInterval(interval);
                addFeedReviewButton();
            }
        }, 1000);
    }

    const containerStyle = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#232222",
        color: "#fff",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        padding: "20px",
        width: "70vw",
        height: "70vh",
        overflowY: "auto",
        zIndex: "9999",
        opacity: "0",
        transform: "scale(0.9) translate(-50%, -50%)",
        transition: "opacity 0.5s ease-in, transform 0.9s ease-in",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    };

    const closeButtonStyle = {
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "transparent",
        color: "#aaa",
        border: "none",
        borderRadius: "5px",
        padding: "10px 20px",
        cursor: "pointer",
        zIndex: "10001",
        textShadow: "0 0 3px #aaa",
        display: "inline-block",
        lineHeight: "20px",
    };

    const nukeButtonStyle = {
        position: "absolute",
        top: "10px",
        right: "120px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        padding: "10px 20px",
        cursor: "pointer",
        zIndex: "10001",
        display: "inline-block",
        lineHeight: "20px",
    };

    const feedItemStyle = {
        borderBottom: "1px solid #444",
        padding: "20px",
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        marginBottom: "10px",
        marginTop: "10px",
        top: "34px",
        position: "relative",
        cursor: "pointer",
        backgroundColor: "#2a2a2a",
        borderRadius: "10px",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
    };

    const avatarStyle = {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        marginRight: "15px",
    };

    const contentDivStyle = {
        flex: "1",
        display: "flex",
        flexDirection: "column",
    };

    const contentStyle = {
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: "#333",
        borderRadius: "5px",
    };

    const commentContainerStyle = {
        width: "calc(100% - 40px)", // Adjust for padding and spacing
        backgroundColor: "#3a3a3a",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
        borderRadius: "5px",
        marginTop: "8px", // Space above the comment container
        padding: "10px",
        maxHeight: "0", // Start with hidden height
        overflowY: "hidden",
        opacity: "0",
        transition: "max-height 0.5s ease-out, opacity 0.5s ease-out", // Smooth animation
        position: "relative",
    };

    const commentListStyle = {
        marginTop: "6px",
        paddingLeft: "0",
        listStyleType: "none",
        color: "#ccc",
        paddingRight: "10px",
        paddingBottom: "10px",
    };

    const noCommentsInfoStyle = {
        color: "#999",
        fontSize: "14px",
        marginTop: "10px",
        padding: "10px",
        textAlign: "center",
        backgroundColor: "#333",
        borderRadius: "5px",
    };

    const deleteButtonStyle = {
        position: "absolute",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: "10001",
        display: "inline-block",
        lineHeight: "20px",
        fontSize: "18px",
        color: "#fff",
    };

    const commentDeleteButtonStyle = {
        position: "absolute",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: "10001",
        display: "inline-block",
        lineHeight: "20px",
        fontSize: "18px",
        color: "#fff",
    };

    let lastOpenedFeedItem = null; // To keep track of the last opened feed item

    async function fetchAndDisplayFeeds() {
        const userId = window.location.pathname.split("/")[2];
        const counterLimit = 10;

        async function fetchData(counter) {
            const url = `https://www.kogama.com/api/feed/${userId}/?page=${counter}&count=10`;
            console.log(`Fetching data from ${url}`);
            try {
                const response = await fetch(url, { credentials: "omit" }); // Use omit for profile feed
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log(`Received data:`, data);
                return data;
            } catch (error) {
                console.error(`Failed to fetch data for counter ${counter}:`, error);
                return null;
            }
        }

        function createContainer() {
            const container = createElementWithStyle("div", containerStyle);
            document.body.appendChild(container);

            requestAnimationFrame(() => {
                container.style.opacity = "1";
                container.style.transform = "scale(1) translate(-50%, -50%)";
            });

            const closeButton = createButton("closeButton", "X", closeButtonStyle, () => {
                container.style.opacity = "0";
                container.style.transform = "scale(0.9) translate(-50%, -50%)";
                setTimeout(() => container.remove(), 500); // Wait for animation to finish before removing
            });
            container.appendChild(closeButton);

            const nukeButton = createButton("nukeButton", "Delete All", nukeButtonStyle, deleteAllFeeds);
            container.appendChild(nukeButton);

            return container;
        }

        async function deleteAllFeeds() {
            const feedItems = document.querySelectorAll(".feedItem");
            for (const feed of feedItems) {
                await deleteFeed(feed.dataset.feedId);
                feed.remove();
            }
            alert("All feed items have been deleted.");
        }

        async function deleteFeed(feedId) {
            const url = `https://www.kogama.com/api/feed/${userId}/${feedId}`;
            console.log(`Sending DELETE request to ${url}`);
            try {
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                console.log(`Response status: ${response.status}`);
                if (!response.ok) {
                    console.error(`Failed to delete feed item ${feedId}: HTTP status ${response.status}`);
                } else {
                    const feedItem = document.querySelector(`.feedItem[data-feed-id='${feedId}']`);
                    if (feedItem) {
                        feedItem.style.opacity = "0";
                        setTimeout(() => feedItem.remove(), 500); // Wait for animation to finish before removing
                    }
                }
            } catch (error) {
                console.error(`Failed to delete feed item ${feedId}:`, error);
            }
        }

        async function fetchComments(feedId) {
            const url = `https://www.kogama.com/api/feed/${feedId}/comment/?count=300`;
            console.log(`Fetching comments from ${url}`);
            try {
                const response = await fetch(url, { credentials: "include" });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log(`Received comments data:`, data);
                return data;
            } catch (error) {
                console.error(`Failed to fetch comments for feed ${feedId}:`, error);
                return { data: [] };
            }
        }

        function toggleComments(feedItem, feedId) {
            if (lastOpenedFeedItem && lastOpenedFeedItem.feedId !== feedId) {
                lastOpenedFeedItem.container.style.maxHeight = "0";
                lastOpenedFeedItem.container.style.opacity = "0";
                setTimeout(() => lastOpenedFeedItem.container.remove(), 500);
                lastOpenedFeedItem = null;
            }

            if (lastOpenedFeedItem && lastOpenedFeedItem.feedId === feedId) {
                lastOpenedFeedItem.container.style.maxHeight = "0";
                lastOpenedFeedItem.container.style.opacity = "0";
                setTimeout(() => lastOpenedFeedItem.container.remove(), 500);
                lastOpenedFeedItem = null;
                return;
            }

            fetchComments(feedId).then(({ data: comments }) => {
                let commentContainer = feedItem.nextSibling;
                if (commentContainer && commentContainer.classList.contains("commentContainer")) {
                    commentContainer.style.maxHeight = "0";
                    commentContainer.style.opacity = "0";
                    setTimeout(() => commentContainer.remove(), 500);
                    lastOpenedFeedItem = null;
                    return;
                }

                commentContainer = createElementWithStyle("div", commentContainerStyle);
                commentContainer.className = "commentContainer";

                if (comments.length === 0) {
                    const noCommentsInfo = createElementWithStyle("div", noCommentsInfoStyle);
                    noCommentsInfo.textContent = "No comments yet.";
                    commentContainer.appendChild(noCommentsInfo);
                } else {
                    const commentListElement = createElementWithStyle("ul", commentListStyle);
                    comments.forEach(comment => {
                        const listItem = createElementWithStyle("li", contentStyle);
                        listItem.style.position = "relative";
                        listItem.dataset.commentId = comment.id;

                        const avatarUrl = comment.images ? comment.images.medium : 'https://www.kogstatic.com/placeholder/blockboy_medium_64x64.jpg';
                        const avatar = document.createElement("img");
                        avatar.src = avatarUrl;
                        avatar.alt = "Comment Avatar";
                        avatar.style.width = "64px";
                        avatar.style.height = "64px";
                        avatar.style.borderRadius = "50%";
                        avatar.style.marginRight = "10px";

                        const commentContent = document.createElement("div");
                        commentContent.innerHTML = `<strong>${comment.profile_username}</strong><br>${JSON.parse(comment._data).data}`;
                        commentContent.style.marginRight = "40px";

                        listItem.appendChild(avatar);
                        listItem.appendChild(commentContent);

                        const deleteCommentButton = createButton(`delete-comment-${comment.id}`, "🗑️", commentDeleteButtonStyle, () => deleteComment(comment.id));
                        listItem.appendChild(deleteCommentButton);

                        commentListElement.appendChild(listItem);
                    });

                    commentContainer.appendChild(commentListElement);
                }

                feedItem.parentNode.insertBefore(commentContainer, feedItem.nextSibling);

                requestAnimationFrame(() => {
                    commentContainer.style.maxHeight = "500px";
                    commentContainer.style.opacity = "1";
                });

                lastOpenedFeedItem = {
                    container: commentContainer,
                    feedId: feedId
                };
            });
        }

        async function deleteComment(commentId) {
            const url = `https://www.kogama.com/api/feed/${userId}/comment/${commentId}/`;
            console.log(`Sending DELETE request to ${url}`);
            try {
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                console.log(`Response status: ${response.status}`);
                if (!response.ok) {
                    console.error(`Failed to delete comment ${commentId}: HTTP status ${response.status}`);
                } else {
                    const commentItem = document.querySelector(`li[data-comment-id='${commentId}']`);
                    if (commentItem) {
                        commentItem.style.opacity = "0";
                        setTimeout(() => commentItem.remove(), 500);
                    }
                }
            } catch (error) {
                console.error(`Failed to delete comment ${commentId}:`, error);
            }
        }

        function createFeedItem(item) {
            const feedItem = createElementWithStyle("div", feedItemStyle);
            feedItem.className = "feedItem";
            feedItem.dataset.feedId = item.id;

            const avatarUrl = item.avatar_images ? item.avatar_images.medium : 'https://www.kogama.com/placeholder/blockboy_medium_64x64.jpg';
            const avatar = document.createElement("img");
            avatar.src = avatarUrl;
            avatar.alt = "User Avatar";
            avatar.style.width = avatarStyle.width;
            avatar.style.height = avatarStyle.height;
            avatar.style.borderRadius = avatarStyle.borderRadius;
            avatar.style.marginRight = "15px";

            const contentDiv = createElementWithStyle("div", contentDivStyle);
            const username = document.createElement("strong");
            username.textContent = item.profile_username;

            const dateElement = document.createElement("span");
            dateElement.textContent = new Date(item.created).toLocaleDateString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            dateElement.style.marginRight = "10px";

            const message = document.createElement("p");
            message.textContent = item._data ? JSON.parse(item._data).status_message : "No message";
            message.style.margin = "0";
            message.style.marginLeft = "10px";

            contentDiv.append(dateElement, username, message);
            feedItem.append(avatar, contentDiv);

            const deleteButton = createButton(`delete-${item.id}`, "🗑️", deleteButtonStyle, () => deleteFeed(item.id));
            feedItem.appendChild(deleteButton);

            feedItem.addEventListener("click", () => toggleComments(feedItem, item.id));

            return feedItem;
        }

        const container = createContainer();
        for (let counter = 1; counter <= counterLimit; counter++) {
            const data = await fetchData(counter);
            if (!data || !data.data.length) break;
            data.data.forEach(item => {
                const feedItem = createFeedItem(item);
                container.appendChild(feedItem);
            });
        }
    }

    waitForTargetDiv();
})();
(function() {
    'use strict';

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        return date.toLocaleString('en-GB', options);
    }

    function createPopup() {
        const popup = document.createElement('div');
        popup.id = 'feedPopup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#f9f9f9';
        popup.style.color = '#333';
        popup.style.border = '1px solid #ddd';
        popup.style.padding = '15px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
        popup.style.zIndex = '9999';
        popup.style.display = 'none';
        popup.style.maxWidth = '600px';
        popup.style.overflowY = 'auto';
        popup.style.maxHeight = '80vh';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.background = '#eee';
        closeButton.style.border = '1px solid #ddd';
        closeButton.style.color = '#333';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '14px';
        closeButton.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        popup.appendChild(closeButton);
        document.body.appendChild(popup);

        return popup;
    }

    function createCommentSection(postId, comments) {
        const section = document.createElement('div');
        section.style.padding = '10px';
        section.style.borderTop = '1px solid #ddd';
        section.style.marginTop = '10px';
        section.style.backgroundColor = '#fafafa';
        section.style.maxHeight = '150px';
        section.style.overflowY = 'auto';

        if (comments.length === 0) {
            section.innerHTML = '<p>No comments found.</p>';
            return section;
        }

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.style.marginBottom = '10px';
            commentDiv.style.padding = '10px';
            commentDiv.style.backgroundColor = '#fff';
            commentDiv.style.border = '1px solid #ddd';
            commentDiv.style.borderRadius = '5px';
            commentDiv.style.display = 'flex';
            commentDiv.style.alignItems = 'center';

            const avatarImg = document.createElement('img');
            avatarImg.src = comment.images.medium;
            avatarImg.alt = comment.profile_username;
            avatarImg.style.width = '40px';
            avatarImg.style.height = '40px';
            avatarImg.style.borderRadius = '50%';
            avatarImg.style.marginRight = '10px';

            const content = document.createElement('div');
            content.innerHTML = `
                <a href="/profile/${comment.profile_id}" class="username-link" style="color: #6a1b9a;">${comment.profile_username}</a><br>
                ${JSON.parse(comment._data).data}<br>
                <small style="color: #888;">${formatTimestamp(comment.created)}</small>
            `;

            commentDiv.appendChild(avatarImg);
            commentDiv.appendChild(content);

            if (comment.can_delete) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'DELETE';
                deleteButton.style.background = '#ffdddd';
                deleteButton.style.border = '1px solid #ddd';
                deleteButton.style.color = '#ff0000';
                deleteButton.style.padding = '2px 5px';
                deleteButton.style.borderRadius = '3px';
                deleteButton.style.cursor = 'pointer';
                deleteButton.style.fontSize = '10px';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', () => deleteComment(postId, comment.id));
                commentDiv.appendChild(deleteButton);
            }

            section.appendChild(commentDiv);
        });

        return section;
    }

    function fetchComments(postId) {
        const apiUrl = `https://www.kogama.com/api/feed/${postId}/comment/?count=993`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            onload: function(response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    const commentSection = createCommentSection(postId, data.data);
                    const commentContainer = document.getElementById(`comments-${postId}`);
                    if (commentContainer) {
                        commentContainer.innerHTML = commentSection.innerHTML;
                        commentContainer.style.display = 'block';
                        console.log(`Comments for post ${postId} updated.`);
                    }
                } else {
                    const commentContainer = document.getElementById(`comments-${postId}`);
                    if (commentContainer) {
                        commentContainer.innerHTML = '<p>No comments found.</p>';
                    }
                }
            },
            onerror: function() {
                console.error('Failed to fetch comments');
            }
        });
    }

    function displayFeedData(feedData) {
        const popup = document.getElementById('feedPopup');
        popup.innerHTML = '';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.background = '#eee';
        closeButton.style.border = '1px solid #ddd';
        closeButton.style.color = '#333';
        closeButton.style.padding = '5px 10px';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '14px';
        closeButton.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        popup.appendChild(closeButton);

        feedData.forEach(item => {
            let statusMessage = 'Feed object responsible either for new username, map or obtained avatar.';

            try {
                if (item._data) {
                    const data = JSON.parse(item._data);
                    if (data.status_message) {
                        statusMessage = data.status_message.replace(/\n/g, '<br>');
                    }
                }
            } catch (e) {
                console.error('Error parsing _data:', e);
            }

            const content = document.createElement('div');
            content.style.marginBottom = '15px';
            content.style.padding = '10px';
            content.style.backgroundColor = '#fff';
            content.style.border = '1px solid #ddd';
            content.style.borderRadius = '5px';
            content.style.wordWrap = 'break-word';

            content.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <img src="${item.profile_images.medium}" alt="${item.profile_username}" style="width: 64px; height: 64px; border-radius: 50%; margin-right: 10px;">
                    <div>
                        <a href="/profile/${item.profile_id}" class="username-link" style="color: #6a1b9a;">${item.profile_username}</a><br>
                        <span style="color: #333;">${statusMessage}</span><br>
                        <small style="color: #888;">${formatTimestamp(item.created)} <span style="color: #6a1b9a;">#${item.id}</span></small><br>
                        <button id="commentsButton-${item.id}" style="background: #eee; border: 1px solid #ddd; color: #666; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-top: 5px;">COMMENTS</button>
                        <div id="comments-${item.id}" style="display: none;"></div>
                        ${item.can_delete ? `<button style="background: #ffdddd; border: 1px solid #ddd; color: #ff0000; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-top: 5px;" onclick="deletePost(${item.id})">DELETE POST</button>` : ''}
                    </div>
                </div>
            `;

            popup.appendChild(content);

            const commentsButton = document.getElementById(`commentsButton-${item.id}`);
            commentsButton.addEventListener('click', () => fetchComments(item.id));
        });

        popup.style.display = 'block';
    }

    function handleButtonClick() {
        const profileID = window.location.pathname.split('/')[2];
        const apiUrl = `https://www.kogama.com/api/feed/${profileID}/?page=1&count=130`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'omit'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            displayFeedData(data.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    function extractOptionsBootstrap(scriptContent) {
        const match = scriptContent.match(/options\.bootstrap\s*=\s*(\{[\s\S]*?\});/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function addButton() {
        const targetDiv = document.querySelector('div._1Noq6');
        if (targetDiv) {
            if (document.querySelector('#fetchFeedButton')) return;

            const iconUrl = 'https://i.imgur.com/QWrIZxT.png';
            const newButton = document.createElement('button');
            newButton.id = 'fetchFeedButton';
            newButton.style.filter = 'invert(100%)';
            newButton.title = 'Fetch Feed';
            newButton.style.background = `url(${iconUrl}) no-repeat center center`;
            newButton.style.backgroundSize = '32px 32px';
            newButton.style.width = '32px';
            newButton.style.height = '32px';
            newButton.style.border = 'none';
            newButton.style.cursor = 'pointer';
            newButton.style.marginRight = '10px';
            newButton.style.display = 'inline-block';
            newButton.style.zIndex = '992';
            newButton.addEventListener('click', handleButtonClick);

            targetDiv.appendChild(newButton);
        }
    }

    function checkIfMe() {
        const scriptTags = document.querySelectorAll('head script');
        let found = false;

        scriptTags.forEach(scriptTag => {
            const scriptContent = scriptTag.textContent;
            const bootstrapJson = extractOptionsBootstrap(scriptContent);

            if (bootstrapJson) {
                found = true;
                try {
                    const options = new Function('return ' + bootstrapJson)();
                    const isMe = options.object.is_me;

                    if (!isMe) {
                        addButton();
                    }
                } catch (e) {
                    console.error('Error parsing bootstrap options:', e);
                }
            }
        });

        if (!found) {
            addButton();
        }
    }

    function init() {
        createPopup();
        window.fetchComments = fetchComments;
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (document.querySelector('div._1Noq6')) {
                        observer.disconnect();
                        checkIfMe();
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    init();
})();
(function() {
    'use strict';

    let chatData = null;

    function addExportButton() {
        const targetElement = document.querySelector('.F3PyX');
        if (targetElement && !document.querySelector('.export-btn')) {
            const exportButton = document.createElement('button');
            exportButton.className = 'export-btn';
            exportButton.title = 'Export chat history to a text file. In case it does not work close and reopen the chat.';
            exportButton.style.width = '30px';
            exportButton.style.height = '30px';
            exportButton.style.background = 'url(https://i.imgur.com/hG5QwIl.gif) center center / 16px 16px no-repeat';
            exportButton.style.border = 'none';
            exportButton.style.cursor = 'pointer';
            exportButton.style.position = 'absolute';
            exportButton.style.top = '50%';
            exportButton.style.right = '37px';
            exportButton.style.transform = 'translateY(-50%)';
            targetElement.style.position = 'relative';
            targetElement.appendChild(exportButton);

            exportButton.addEventListener('click', function() {
                exportChatHistory();
            });
        }
    }

    function exportChatHistory() {
        if (chatData) {
            chatData.reverse();
            let formattedChat = chatData.map(message => {
                const timestamp = new Date(message.created).toLocaleString();
                return `[ ${timestamp} ] ${message.from_username}: ${message.message}`;
            }).join('\n');
            formattedChat = formattedChat.replace(/\n{2,}/g, '\n');
            const filename = `${chatData[0].to_profile_id}.txt`;
            const blob = new Blob([formattedChat], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } else {
            console.error('No chat data found');
        }
    }
    function monitorRequests() {
        const originalOpen = unsafeWindow.XMLHttpRequest.prototype.open;
        const originalSend = unsafeWindow.XMLHttpRequest.prototype.send;

        unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            originalOpen.apply(this, arguments);
        };
        unsafeWindow.XMLHttpRequest.prototype.send = function(body) {
            this.addEventListener('load', function() {
                if (this._url.includes('/chat/') && this._url.includes('/history/')) {
                    const urlParts = this._url.split('/');
                    const selfId = urlParts[4];
                    const friendId = urlParts[6];

                    console.log('Detected chat history request:', selfId, friendId);

                    if (this.responseType === '' || this.responseType === 'text') {
                        chatData = JSON.parse(this.responseText).data;
                    } else if (this.responseType === 'json') {
                        chatData = this.response.data;
                    }

                    addExportButton();
                }
            });

            originalSend.apply(this, arguments);
        };
    }

    monitorRequests();

})();


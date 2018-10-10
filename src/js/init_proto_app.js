window.ProtoGraph = window.ProtoGraph || {};

ProtoGraph.renderNavbar = function () {
    let mode = window.innerWidth <= 500 ? 'mobile' : 'laptop';
    fetchNavbarObjects().then((data) => {
        processAndRenderVerticalNavbar(data[0], mode);
        processAndRenderHomepageNavbar(data[1], mode);
        processAndRenderSiteHeader(data[2]);
        ProtoGraph.headerJSON = data[2];
        ProtoGraph.initPage();
        if (ProtoGraph.initDataApp && ProtoGraph.initDataApp.constructor === Function) {
            ProtoGraph.initDataApp();
        }
    }).catch((reject) => {
        console.error("Error fetching data : ", reject);
    })
}

function fetchNavbarObjects() {
    return Promise.all([
        getJSONPromise(ProtoGraph.vertical_header_json_url),
        getJSONPromise(ProtoGraph.homepage_header_json_url),
        getJSONPromise(ProtoGraph.site_header_json_url)
    ]);
}

function throttle(fn, wait) {
    var time = Date.now();
    return function () {
        if ((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    }
}

ProtoGraph.initBackToTop = function() {
    $(window).scroll((e) => {
        if ($(e.target).scrollTop() > 100) {
            // downscroll code
            $('.proto-app-scroll-to-top').addClass('proto-app-show');
        } else {
            // upscroll code
            $('.proto-app-scroll-to-top').removeClass('proto-app-show');
        }
    })
    // $(window).scroll(throttle(function (event) {
    //     // var st = $('.protograph-app-main-container').scrollTop(),
    //     //     isActive = $('.protograph-app-swipe-left').hasClass('protograph-app-slide-down');
    // }, 100));

    $('.proto-app-scroll-to-top').on('click', (e) => {
        $('.proto-app-scroll-to-top').removeClass('proto-app-show');
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });
}

function processAndRenderVerticalNavbar(data, mode) {
    if (data.length > 0) {
        let HTML = "";
        switch (mode) {
            case 'laptop':
                data.forEach((e, i) => {
                    HTML += `<div class="page-nav-single-option">
                        <a href="${e.url}" target=${e.new_window ? "_blank" : "_self"}>${e.name}</a>
                    </div>`
                });
                $('#vertical_nav').append(HTML);
                break;
            case 'mobile':
                data.forEach((e, i) => {
                    HTML += `<div class="single-link"><a href="${e.url}" target=${e.new_window ? "_blank" : "_self"}>${e.name}</a></div>`;
                });
                $('.mobile-navigations-screen .nav-links').append(HTML);
                break;
        }
    }
}

function processAndRenderHomepageNavbar(data, mode) {
    let filtered_data = data.filter((e, i) => {
        return e.name !== ProtoGraph.ref_category_object.name
    }),
    homepage_object = data.filter((e, i) => {
        return e.name === ProtoGraph.ref_category_object.name
    })[0],
    home_navbar,
    home_navbar_list,
    width,
    top,
    border_radius,
    left;

    switch (mode) {
        case 'laptop':
            home_navbar = '#homepage_nav';
            home_navbar_list = '#homepage_nav_list';
            // width = $('#homepage_nav').width() + 50;
            width = "250px"
            border_radius = "4px";
            // left = $('.proto-verticals-navbar').offset().left;
            break;
        case 'mobile':
            home_navbar = '.branding';
            home_navbar_list = '#mobile_homepage_nav_list';
            // width = $('.branding').width() + 50;
            width = "100%";
            top = "140px";
            border_radius = "0px";
            // left = 0;
            break;
    }

    if (filtered_data.length > 0) {
        $('.proto-hide').removeClass('proto-hide');
        $(home_navbar_list).css({
            "width": width,
            "top": top,
            "border-radius": border_radius,
            "left": 0
        });
        $(home_navbar).css('cursor', 'pointer');
        $(home_navbar).on('click', (e) => {
            let list = $(home_navbar_list);
            if (list.hasClass('open-navbar')) {
                $(home_navbar_list).removeClass('open-navbar');
            } else {
                $(home_navbar_list).addClass('open-navbar');
            }
        });

        let HTML = "";
        filtered_data.forEach((e, i) => {
            HTML += `<div class="proto-vertical-name home-header-nav">
                <a href="${e.url}" >${e.name_html}</a>
            </div>`
        });
        $(home_navbar_list).append(HTML);
    } else if (homepage_object) {
        let nav_title = $(home_navbar).html();
        $(home_navbar).html(`<a href="${homepage_object.url}" >${nav_title}</a>`);
    }
}

function processAndRenderSiteHeader(data) {
    if (data) {
        $('#site_header').css('background', data.header_background_color);
        let logo_div = $('#site_header .client-logo');
        logo_div.addClass(`position-${data.header_logo_position}`);
        logo_div.append(`<a href="${data.header_jump_to_link}" target="_blank"><img src="${data.header_logo_url}" /></a>`);
    }
}

function getJSONPromise(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText)
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}
document.addEventListener("DOMContentLoaded", function (event) {
    ProtoGraph.renderNavbar();
    ProtoGraph.initBackToTop();
});
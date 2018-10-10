import Util from './utility.js';

ProtoGraph.initPage = function () {
  let dimension = Util.getScreenSize(),
    mode = (dimension.width <= 500) ? 'mobile' : 'laptop',
    render_mode = (dimension.width <= 500) ? 'col4' : 'col7',
    cover_height = (dimension.width <= 500) ? '250px' : '430px',
    background_size = (dimension.width <= 500) ? 'cover' : '100%',
    streams = ProtoGraph.streams,
    page = ProtoGraph.page,
    headerJSON = ProtoGraph.headerJSON;

  if (mode === 'laptop') {
    let sticky_sidebar_options = {
      containerSelector: "#card-list-div",
      additionalMarginTop: 10,
      additionalMarginBottom: 10
    };
    $('.filter-column').theiaStickySidebar(sticky_sidebar_options);
    $('#protograph_filter_icon').css('display', 'none');
  }

  if (mode === 'mobile') {
    $('#protograph_filter_icon').on('click', ((e) => {
      $('.protograph-app-filter-icon').addClass('block-events');
      $('.protograph-filter-area').css('display', 'block');
      setTimeout((e) => {
        $('.protograph-filter-area').addClass('protograph-filter-area-slide-up');
      }, 0);
      $('#protograph_filter_icon').css('display', 'none');
      $('#protograph_filter_close_icon').css('display', 'block');
      setTimeout((i) => {
        $('.protograph-app-filter-icon').removeClass('block-events');
      }, 500);
    }));

    $('#protograph_filter_close_icon').on('click', ((e) => {
      $('.protograph-app-filter-icon').addClass('block-events');
      $('.protograph-filter-area').removeClass('protograph-filter-area-slide-up');
      setTimeout((e) => {
        $('.protograph-filter-area').css('display', 'none');
        $('.protograph-app-filter-icon').removeClass('block-events');
      }, 500);
      $('#protograph_filter_icon').css('display', 'block');
      $('#protograph_filter_close_icon').css('display', 'none');
    }));

    $('#dropdownMenuButton').on('click', (e) => {
      $('.protograph-app-navbar').addClass('protograph-app-navbar-slide-in');
      $('body').css('overflow', 'hidden');
      $('.container.proto-container').css('overflow', 'hidden');
    });

    $('#protograph_app_close_menu').on('click', (e) => {
      $('.protograph-app-navbar').removeClass('protograph-app-navbar-slide-in');
      $('body').css('overflow', 'initial');
      $('.container.proto-container').css('overflow', 'initial');
    });
  }

  if (page && streams['16c_Hero']) {
    Util.getJSON(streams['16c_Hero'].url, function (err, data) {
      if (err != null) {
        console.error("Error fetching 16c stream", err);
      } else {
        let cover_container = document.getElementById("col_16_cover_container"),
          mode_for_cover = (mode === 'mobile') ? "col4" : "col16";

        if (data.length > 0) {
          data = [data[0]];
          data.map((d, i) => {
            let div = document.createElement('div'),
              marginDiv = document.createElement('div');

            div.id = `ProtoCard_16c_cover_${i}`;
            div.className = "ProtoCard-cover";
            cover_container.appendChild(div);

            marginDiv.style.marginBottom = "20px";
            cover_container.appendChild(marginDiv);
            setTimeout(function () {
              var sandbox_iframe = new ProtoEmbed.initFrame(document.getElementById(`ProtoCard_16c_cover_${i}`), data[i].iframe_url + "&policy=" + ProtoGraph.page.headline, mode_for_cover, {
                headerJSON: headerJSON
              });
            }, 0)
          })
        } else {
          $('#col_16_cover_container').append(`
            <div class="fixed-cover-block fixed-cover-block-small" id="proto_col_16_cover_blank">
              ${page.cover_image_url || page.cover_image_url_7_column ? '<div class="proto-black-background"></div>' : ''}
              <h1 class="page-title bottom-pull-div">
                  ${page.headline}
              </h1>
            </div>
          `);
          if (page.cover_image_url || page.cover_image_url_7_column) {
            setTimeout((e) => {
              $('#proto_col_16_cover_blank').css({
                'background-image': `url(${page.cover_image_url || page.cover_image_url_7_column})`,
                'height': cover_height,
                'background-size': background_size,
                'background-repeat': "no-repeat"
              })
            });
          }
        }
      }
    });
  } else {
    $('#col_16_cover_container').append(`
      <div class="fixed-cover-block fixed-cover-block-small" id="proto_col_16_cover_blank">
        ${page.cover_image_url || page.cover_image_url_7_column ? '<div class="proto-black-background"></div>' : ''}
        <h1 class="page-title bottom-pull-div">
            ${page.headline}
        </h1>
      </div>
    `);
    if (page.cover_image_url || page.cover_image_url_7_column) {
      setTimeout((e) => {
        $('#proto_col_16_cover_blank').css({
          'background-image': `url(${page.cover_image_url || page.cover_image_url_7_column})`,
          'height': cover_height,
          'background-size': background_size,
          'background-repeat': "no-repeat"
        });
      });
    }
  }
}
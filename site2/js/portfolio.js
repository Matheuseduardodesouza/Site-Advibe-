/**
 * Easy selector helper function
 */
const select = (el, all = false) => {
    el = el.trim()
    if (all) {
        return [...document.querySelectorAll(el)]
    } else {
        return document.querySelector(el)
    }
}

// Fn to allow an event to fire after all images are loaded
$.fn.imagesLoaded = function () {

    // get all the images (excluding those with no src attribute)
    var $imgs = this.find('img[src!=""]');
    // if there's no images, just return an already resolved promise
    if (!$imgs.length) {return $.Deferred().resolve().promise();}

    // for each image, add a deferred object to the array which resolves when the image is loaded (or if loading fails)
    var dfds = [];
    $imgs.each(function(){

        var dfd = $.Deferred();
        dfds.push(dfd);
        var img = new Image();
        img.onload = function(){dfd.resolve();}
        img.onerror = function(){dfd.resolve();}
        img.src = this.src;

    });

    // return a master promise object which will resolve when all the deferred objects have resolved
    // IE - when all the images are loaded
    return $.when.apply($,dfds);

}

function load(url) {
    $.ajax({
        url,
        type: "POST",
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
    })
        .done(function(result){
            if (result && result.success) {
                var content = '';
                result.images.forEach(function(media){
                    var src_medium = window.location.origin+'/storage/portfolio/medium/'+media.image;
                    var src_large = window.location.origin+'/storage/portfolio/large/'+media.image;

                    content = content + `
                        <div class="col-lg-3 col-md-6 portfolio-item">
                            <div class="portfolio-img">
                                <img
                                    src="${src_medium}"
                                    class="img-fluid"
                                    alt="..."
                                />
                                <div class="portfolio-info">
                                    <p>Abrir como galeria</p>
                                    <a
                                        href="${src_large}"
                                        data-gallery="portfolioGallery"
                                        class="portfolio-lightbox preview-link">
                                        <i class="bx bx-zoom-in"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                });

                if (result.images.length === 0) {
                    content = `
                        <div class="col-12">
                            <div class="alert border-0 border-start border-5 border-warning py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-warning"><i class='bx bx-info-circle'></i>
                                    </div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-warning">Oops!</h6>
                                        <div>Ainda não há imagens cadastradas para essa categoria :(</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
            $('#spinner').show();
            $('.portfolio-container').hide().html(content).imagesLoaded().then(function(){
                $('.portfolio-container').show();
                let portfolioContainer = select('.portfolio-container');
                if (portfolioContainer) {
                    new Isotope(portfolioContainer, {
                        itemSelector: '.portfolio-item',
                    });
                }

                GLightbox({
                    selector: '.portfolio-lightbox'
                });
                $('#spinner').hide();
            });
        })
        .fail(function(xhr, status, error) {
            $('#spinner').show();
            console.log(status, error)
        }
    );
}

$(document).on("click",".link-category",function(event){
    event.preventDefault();
    $('.link-category').removeClass('active');
    $(this).addClass('active');
    load($(this).attr('data-action'));
});

$(document).ready(function() {
    $('#spinner').hide();
});


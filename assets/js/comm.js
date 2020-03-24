$(document).ready(function () {
    $(".select_jump").on("change", function () {
        window.location.href = $(this).val();
    });
});
// Mobile Menu Fix - Ensure hamburger works on all pages
$(document).ready(function() {
  
  // More flexible selector for the hamburger menu
  function initMobileMenu() {
    var menuIcon = $("#header #nav ul .icon a");
    var menuList = $("#header #nav ul");
    
    // Remove any existing click handlers to avoid duplicates
    menuIcon.off('click.mobilemenu');
    
    // Add our click handler
    menuIcon.on('click.mobilemenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle the responsive class
      menuList.toggleClass("responsive");
      
      // Change icon if Font Awesome is available
      var icon = $(this).find('i');
      if (icon.length) {
        if (menuList.hasClass("responsive")) {
          icon.removeClass('fa-bars').addClass('fa-times');
        } else {
          icon.removeClass('fa-times').addClass('fa-bars');
        }
      }
      
      return false;
    });
    
    // Close menu when clicking outside
    $(document).on('click.mobilemenu', function(e) {
      if (!$(e.target).closest('#header #nav').length) {
        menuList.removeClass("responsive");
        menuIcon.find('i').removeClass('fa-times').addClass('fa-bars');
      }
    });
    
    // Close menu when clicking on menu items (except the icon)
    menuList.find('li:not(.icon) a').on('click.mobilemenu', function() {
      menuList.removeClass("responsive");
      menuIcon.find('i').removeClass('fa-times').addClass('fa-bars');
    });
  }
  
  // Initialize immediately
  initMobileMenu();
  
  // Also try after a small delay in case DOM isn't fully ready
  setTimeout(initMobileMenu, 100);
  
});
import UIKit

class BrandManager {

    // --------------------------------------
    // MARK: Private
    // --------------------------------------

    private class func _setDefaultNavBarTheme() {
        let appearance = UINavigationBar.appearance()
        appearance.setBackgroundImage(UIImage(), for: .default)
        appearance.shadowImage = UIImage()
        appearance.isTranslucent = false
        appearance.barStyle = .default
        appearance.barTintColor = ColorBrand.navBarBackgroundColor
        appearance.tintColor = ColorBrand.navBarTintColor
        appearance.prefersLargeTitles = false
        if #available(iOS 13.0, *) {
            let navBarAppearance = UINavigationBarAppearance()
            navBarAppearance.configureWithOpaqueBackground()
            navBarAppearance.titleTextAttributes = [
                NSAttributedString.Key.foregroundColor: ColorBrand.navBarTextColor,
                NSAttributedString.Key.font: FontBrand.navBarTitleFont
            ]
            navBarAppearance.largeTitleTextAttributes = [
                NSAttributedString.Key.foregroundColor: ColorBrand.navBarTextColor,
                NSAttributedString.Key.font: FontBrand.largeNavBarTitleFont
            ]
            navBarAppearance.backgroundColor = ColorBrand.navBarBackgroundColor
            appearance.standardAppearance = navBarAppearance
            appearance.scrollEdgeAppearance = navBarAppearance
            navBarAppearance.shadowColor = .clear
        } else {
            appearance.titleTextAttributes = [
                NSAttributedString.Key.foregroundColor: ColorBrand.navBarTextColor,
                NSAttributedString.Key.font: FontBrand.navBarTitleFont
            ]
            appearance.largeTitleTextAttributes = [
                NSAttributedString.Key.foregroundColor: ColorBrand.navBarTextColor,
                NSAttributedString.Key.font: FontBrand.largeNavBarTitleFont
            ]
        }
    }

    private class func _setTransparentnavBarTheme() {
        let appearance = UINavigationBar.appearance()
        appearance.setBackgroundImage(UIImage(), for: .default)
        appearance.shadowImage = UIImage()
        appearance.barTintColor = UIColor.clear
        appearance.tintColor = ColorBrand.navBarTintColor
        appearance.isTranslucent = true
        appearance.barStyle = .default
        appearance.titleTextAttributes = [
            NSAttributedString.Key.foregroundColor: ColorBrand.appColorDarkGray,
            NSAttributedString.Key.font: FontBrand.navBarTitleFont
        ]
    }

    private class func _setTabBarTheme() {
        let tabBarAppearance = UITabBar.appearance()
        let tabBarItemAppearance = UITabBarItem.appearance()
        tabBarAppearance.tintColor = ColorBrand.tabBarTintColor
        tabBarAppearance.unselectedItemTintColor = ColorBrand.tabBarUnselectedColor
        tabBarAppearance.barTintColor = ColorBrand.tabBarBackgroundColor
        tabBarAppearance.backgroundColor = ColorBrand.tabBarBackgroundColor
        tabBarItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.tabBarUnselectedColor,
            NSAttributedString.Key.font: FontBrand.tabbarTitleFont
        ], for: .normal)
        tabBarItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.tabBarSeltectedColor,
            NSAttributedString.Key.font: FontBrand.tabbarSelectedTitleFont
        ], for: .selected)
    }

    private class func _setSearchBarTheme() {
        let appearance = UISearchBar.appearance()
        appearance.setBackgroundImage(nil, for: .any, barMetrics: .default)
        appearance.barTintColor = ColorBrand.searchBarBarTintColor
        appearance.tintColor = ColorBrand.searchBarTintColor
        appearance.isTranslucent = true
        appearance.searchBarStyle = .default
        let textFieldAppearance = UITextField.appearance(whenContainedInInstancesOf: [UISearchBar.self])
        textFieldAppearance.font = FontBrand.toolBarTitleFont
        textFieldAppearance.textColor = ColorBrand.searchBarTextColor
        textFieldAppearance.defaultTextAttributes = [
            NSAttributedString.Key.foregroundColor: ColorBrand.searchBarTextColor,
            NSAttributedString.Key.font: FontBrand.toolBarTitleFont
        ]
        let barButtonItemAppearance = UIBarButtonItem.appearance(whenContainedInInstancesOf: [UISearchBar.self])
        barButtonItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.barButtonItemColor,
            NSAttributedString.Key.font: FontBrand.toolBarTitleFont
        ], for: .normal)
        barButtonItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.barButtonItemColor,
            NSAttributedString.Key.font: FontBrand.toolBarTitleFont
        ], for: .selected)
    }

    private class func _setToolbarTheme() {
        let appearance = UIToolbar.appearance()
        appearance.setBackgroundImage(nil, forToolbarPosition: .any, barMetrics: .default)
        appearance.barTintColor = ColorBrand.toolbarBarTintColor
        appearance.tintColor = ColorBrand.toolbarTintColor
        appearance.isTranslucent = true
        let barButtonItemAppearance = UIBarButtonItem.appearance(whenContainedInInstancesOf: [UIToolbar.self])
        barButtonItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.barButtonItemColor,
            NSAttributedString.Key.font: FontBrand.toolBarTitleFont
        ], for: .normal)
        barButtonItemAppearance.setTitleTextAttributes([
            NSAttributedString.Key.foregroundColor: ColorBrand.barButtonItemColor,
            NSAttributedString.Key.font: FontBrand.toolBarTitleFont
        ], for: .selected)
    }

    private class func _setTextFieldTheme() {}

    private class func _setTextViewTheme() {
        let appearance = UITextView.appearance()
        appearance.linkTextAttributes = [
            .foregroundColor: ColorBrand.textViewLinkColor,
            .underlineStyle: NSUnderlineStyle.single.rawValue,
            .underlineColor: ColorBrand.textViewLinkColor
        ]
    }

    private class func _setUISwitchTheme() {
        let appearance = UISwitch.appearance()
        appearance.onTintColor = ColorBrand.switchOnTintColor
        appearance.tintColor = ColorBrand.tintColor
        appearance.thumbTintColor = ColorBrand.switchThumbTintColor
    }

    // --------------------------------------
    // MARK: Public Class
    // --------------------------------------

    class func setDefaultTheme() {
        _setTabBarTheme()
        _setSearchBarTheme()
        _setToolbarTheme()
        _setTextViewTheme()
        _setUISwitchTheme()
        guard APP.isPad else {
            _setDefaultNavBarTheme()
            return
        }
        _setTransparentnavBarTheme()
    }
}

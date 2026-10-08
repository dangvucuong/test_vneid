//
//  ColorBrand.swift
//  eidos
//
//  Created by Tony Kieu on 24/08/2023.
//

import UIKit

class ColorBrand {
    
    // --------------------------------------
    // MARK: Common
    // --------------------------------------
    
    class func RGB(red: CGFloat, green: CGFloat, blue: CGFloat) -> UIColor {
        UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: 1.0)
    }
    
    class func RGBA(red: CGFloat, green: CGFloat, blue: CGFloat, alpha: CGFloat) -> UIColor {
        UIColor(red: red / 255.0, green: green / 255.0, blue: blue / 255.0, alpha: alpha)
    }
    
    class func HEX(_ hex: String) -> UIColor? {
        var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        if (cString.hasPrefix("#")) { cString.remove(at: cString.startIndex) }
        if ((cString.count) != 6) { return nil }
        
        var rgbValue:UInt64 = 0
        Scanner(string: cString).scanHexInt64(&rgbValue)
        return UIColor(
            red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
            alpha: CGFloat(1.0)
        )
    }
    
    // --------------------------------------
    // MARK: Brand Color
    // --------------------------------------
    
    class var appColorBackground: UIColor {
        UIColor(named: "appColorBackground") ?? RGB(red: 250, green: 250, blue: 250)
    }
    
    class var appColorBlack: UIColor {
        UIColor(named: "appColorBlack") ?? RGB(red: 39, green: 39, blue: 39)
    }
    
    class var appColorBlackBrown: UIColor {
        UIColor(named: "appColorBlackBrown") ?? RGB(red: 47, green: 16, blue: 0)
    }
    
    class var appColorBlue: UIColor {
        UIColor(named: "appColorBlue") ?? RGB(red: 62, green: 64, blue: 149)
    }
    
    class var appColorBlueSky: UIColor {
        UIColor(named: "appColorBlueSky") ?? RGB(red: 22, green: 127, blue: 252)
    }
    
    class var appColorBlueTeal: UIColor {
        UIColor(named: "appColorBlueTeal") ?? RGB(red: 1, green: 104, blue: 135)
    }
    
    class var appColorBrown: UIColor {
        UIColor(named: "appColorBrown") ?? RGB(red: 98, green: 27, blue: 0)
    }
    
    class var appColorDarkBlue: UIColor {
        UIColor(named: "appColorDarkBlue") ?? RGB(red: 2, green: 86, blue: 186)
    }
    
    class var appColorDarkGray: UIColor {
        UIColor(named: "appColorDarkGray") ?? RGB(red: 51, green: 53, blue: 69)
    }
    
    class var appColorDarkWhite: UIColor {
        UIColor(named: "gtelBrandDarkWhite") ?? RGB(red: 203, green: 207, blue: 221)
    }
    
    class var appColorDarkYellow: UIColor {
        UIColor(named: "appColorDarkYellow") ?? RGB(red: 255, green: 203, blue: 47)
    }
    
    class var appColorGreen: UIColor {
        UIColor(named: "appColorGreen") ?? RGB(red: 0, green: 168, blue: 89)
    }
        
    class var appColorLightBlue: UIColor {
        UIColor(named: "appColorLightBlue") ?? RGB(red: 60, green: 171, blue: 219)
    }
        
    class var appColorLightDarkGray: UIColor {
        UIColor(named: "appColorLightDarkGray") ?? RGB(red: 80, green: 78, blue: 87)
    }
    
    class var appColorLightGray: UIColor {
        UIColor(named: "appColorLightGray") ?? RGB(red: 105, green: 103, blue: 115)
    }
        
    class var appColorLightGreen: UIColor {
        UIColor(named: "appColorLightGreen") ?? RGB(red: 83, green: 216, blue: 106)
    }
    
    class var appColorLightRed: UIColor {
        UIColor(named: "appColorLightRed") ?? RGB(red: 247, green: 173, blue: 175)
    }
    
    class var appColorLightYellow: UIColor {
        UIColor(named: "appColorLightYellow") ?? RGB(red: 250, green: 222, blue: 170)
    }
    
    class var appColorMint: UIColor {
        UIColor(named: "appColorMint") ?? RGB(red: 97, green: 208, blue: 149)
    }
    
    class var appColorNavy: UIColor {
        UIColor(named: "appColorNavy") ?? RGB(red: 60, green: 73, blue: 94)
    }
    
    class var appColorOrange: UIColor {
        UIColor(named: "appColorOrange") ?? RGB(red: 255, green: 127, blue: 17)
    }
    
    class var appColorOrangeLight: UIColor {
        UIColor(named: "appColorOrangeLight") ?? RGB(red: 255, green: 127, blue: 17)
    }
    
    class var appColorPink: UIColor {
        UIColor(named: "appColorPink") ?? RGB(red: 240, green: 56, blue: 107)
    }
        
    class var appColorPurple: UIColor {
        UIColor(named: "appColorPurple") ?? RGB(red: 89, green: 91, blue: 212)
    }
    
    class var appColorPurpleDark: UIColor {
        UIColor(named: "appColorPurpleDark") ?? RGB(red: 103, green: 58, blue: 183)
    }
    
    class var appColorPurpleLight: UIColor {
        UIColor(named: "appColorPurpleLight") ?? RGB(red: 135, green: 85, blue: 223)
    }
    
    class var appColorRed: UIColor {
        UIColor(named: "appColorRed") ?? RGB(red: 237, green: 50, blue: 55)
    }
    
    class var appColorRedLight: UIColor {
        UIColor(named: "appColorRedLight") ?? RGB(red: 255, green: 212, blue: 213)
    }
    
    class var appColorRedOrange: UIColor {
        UIColor(named: "appColorRedOrange") ?? RGB(red: 252, green: 81, blue: 48)
    }
    
    class var appColorRedOrangeLight: UIColor {
        UIColor(named: "appColorRedOrangeLight") ?? RGB(red: 251, green: 220, blue: 214)
    }
    
    class var appColorSilver: UIColor {
        UIColor(named: "appColorSilver") ?? RGB(red: 249, green: 249, blue: 249)
    }
    
    class var appColorSilverGray: UIColor {
        UIColor(named: "appColorSilverGray") ?? RGB(red: 213, green: 213, blue: 213)
    }
    
    class var appColorTransparentBlack: UIColor {
        UIColor(named: "appColorTransparentBlack") ?? RGBA(red: 213, green: 213, blue: 213, alpha: 0.3)
    }
    
    class var appColorTransparentLightRed: UIColor {
        UIColor(named: "appColorTransparentLightRed") ?? RGBA(red: 247, green: 173, blue: 175, alpha: 0.3)
    }
    
    class var appColorYellow: UIColor {
        UIColor(named: "appColorYellow") ?? RGB(red: 247, green: 173, blue: 175)
    }
    
    class var appColorWhite: UIColor {
        UIColor(named: "appColorWhite") ?? RGB(red: 255, green: 255, blue: 255)
    }
    
    class var verifyGreen: UIColor {
        UIColor(named: "verifyGreen") ?? RGB(red: 255, green: 255, blue: 255)
    }
    
    // --------------------------------------
    // MARK: Letter Avatar Colors
    // --------------------------------------
    
    class var letterAvatarColor: [UIColor] {
        var colors: [UIColor] = []
        if let color = HEX("#114E7D") { colors.append(color) }
        if let color = HEX("#F26524") { colors.append(color) }
        if let color = HEX("#9E9C9C") { colors.append(color) }
        if let color = HEX("#31ADF9") { colors.append(color) }
        if let color = HEX("#7AF14A") { colors.append(color) }
        if let color = HEX("#139A43") { colors.append(color) }
        if let color = HEX("#CF2D1B") { colors.append(color) }
        if let color = HEX("#0F4890") { colors.append(color) }
        if let color = HEX("#E35A66") { colors.append(color) }
        if let color = HEX("#474647") { colors.append(color) }
        if let color = HEX("#106107") { colors.append(color) }
        if let color = HEX("#EEB902") { colors.append(color) }
        return colors
    }
    
    // --------------------------------------
    // MARK: UINavigationBar
    // --------------------------------------

    class var navBarBackgroundColor: UIColor {
        return appColorDarkGray
    }

    class var navBarTintColor: UIColor {
        return appColorWhite
    }

    class var navBarTextColor: UIColor {
        return appColorWhite
    }

    class var navBarDisabledColor: UIColor {
        return appColorWhite
    }

    class var navBarPageIndicatorColor: UIColor {
        return appColorWhite
    }

    class var navBarPageHairLineColor: UIColor {
        return appColorRed
    }

    class var navBarSelectedMenuItemLabelColor: UIColor {
        return appColorWhite
    }

    class var navBarUnselectedMenuItemLabelColor: UIColor {
        return appColorWhite
    }

    // --------------------------------------
    // MARK: UISearchBar
    // --------------------------------------

    class var searchBarBackgroundColor: UIColor {
        return appColorWhite
    }

    class var searchBarBarTintColor: UIColor {
        return appColorWhite
    }

    class var searchBarTintColor: UIColor {
        return appColorLightBlue
    }

    class var searchBarTextColor: UIColor {
        return appColorDarkGray
    }

    // --------------------------------------
    // MARK: UIToolbar
    // --------------------------------------

    class var toolbarBackgroundColor: UIColor {
        return appColorWhite
    }

    class var toolbarBarTintColor: UIColor {
        return appColorWhite
    }

    class var toolbarTintColor: UIColor {
        return appColorLightBlue
    }

    class var toolbarTextColor: UIColor {
        return appColorDarkGray
    }

    // --------------------------------------
    // MARK: UITabBar
    // --------------------------------------

    class var tabBarBackgroundColor: UIColor {
        return appColorBackground
    }

    class var tabBarTintColor: UIColor {
        return appColorOrange
    }

    class var tabBarUnselectedColor: UIColor {
        return appColorSilver
    }

    class var tabBarSeltectedColor: UIColor {
        return appColorOrange
    }

    // --------------------------------------
    // MARK: UIBarButtonItem
    // --------------------------------------

    class var barButtonItemColor: UIColor {
        return appColorNavy
    }

    // --------------------------------------
    // MARK: UITableView
    // --------------------------------------

    class var tableViewBackgroundColor: UIColor {
        return appColorWhite
    }

    class var tableViewHeaderBackgroundColor: UIColor {
        return appColorDarkGray
    }

    class var tableViewHeaderTextColor: UIColor {
        return appColorWhite
    }

    class var tableViewHeaderSelectedBackgroundColor: UIColor {
        return appColorRed
    }

    class var tableViewHeaderForegroundColor: UIColor {
        return appColorWhite
    }

    class var tableViewTintColor: UIColor {
        return appColorLightBlue
    }

    class var tableViewGroupedSectionForegroundColor: UIColor {
        return appColorWhite
    }

    class var tableViewGroupedSectionBackgroundColor: UIColor {
        return appColorSilver
    }

    class var tableViewCellBackgroundColor: UIColor {
        return appColorWhite
    }

    class var tableViewCellDetailsColor: UIColor {
        return appColorWhite
    }

    class var tableViewPrimaryColumnBackgroundColor: UIColor {
        return appColorSilver
    }

    class var tableViewSelectedCellBackgroundColor: UIColor {
        return appColorNavy
    }

    class var tableViewSeparatorColor: UIColor {
        return appColorWhite
    }

    class var tableViewEmptyCellBackgroundColor: UIColor {
        return UIColor.clear
    }

    class var tableViewSectionIndexColor: UIColor {
        return appColorDarkGray
    }

    class var tableViewSectionIndexBackgroundColor: UIColor {
        return UIColor.clear
    }

    class var tableViewSectionTextColor: UIColor {
        return appColorSilver
    }

    // --------------------------------------
    // MARK: UILabel & UITextField
    // --------------------------------------

    class var textStyleTitleColor: UIColor {
        return appColorSilver
    }

    class var textStyleTitleShadowColor: UIColor {
        return appColorWhite
    }

    class var textStyleBodyColor: UIColor {
        return appColorDarkGray
    }

    class var textStyleDescriptionColor: UIColor {
        return appColorWhite
    }

    class var textStyleDisabledBodyColor: UIColor {
        return appColorWhite
    }

    class var textStylePlaceholderColor: UIColor {
        return appColorWhite
    }

    class var textStyleErrorColor: UIColor {
        return appColorGreen
    }

    class var textStyleSuccessColor: UIColor {
        return appColorGreen
    }

    class var textStyleLinkColor: UIColor {
        return appColorLightBlue
    }

    class var textViewLinkColor: UIColor {
        return appColorLightBlue
    }

    // --------------------------------------
    // MARK: UISwitch
    // --------------------------------------

    class var switchOnTintColor: UIColor {
        return appColorRed
    }

    class var tintColor: UIColor {
        return appColorDarkGray
    }

    class var switchThumbTintColor: UIColor {
        return appColorSilver
    }

    // --------------------------------------
    // MARK: UITextView
    // --------------------------------------

    class var calendarBackgroundColor: UIColor {
        return appColorOrange
    }

    class var calendarTitleColor: UIColor {
        return appColorWhite
    }

    class var calendarHeaderTitleColor: UIColor {
        return appColorWhite
    }

    class var calendarWeekdayTextColor: UIColor {
        return appColorWhite
    }

    class var calendarTodayColor: UIColor {
        return appColorWhite
    }

    class var calendarSelectionColor: UIColor {
        return appColorNavy
    }

    class var calendarTodaySelectionColor: UIColor {
        return appColorLightBlue
    }
    
    // --------------------------------------
    // MARK: Form
    // --------------------------------------

    class var formStyleTitleColor: UIColor {
        return appColorNavy
    }

    class var formStyleRequiredTitleColor: UIColor {
        return appColorOrange
    }

    class var formStyleTitleDetailColor: UIColor {
        return appColorBlueSky
    }

    class var formStyleLinkColor: UIColor {
        return appColorBlueSky
    }

    class var formStyleTitleDisabledColor: UIColor {
        return appColorSilver
    }

    class var formStyleTitleDetailDisabledColor: UIColor {
        return appColorDarkWhite
    }

    class var formStyleLinkDisabledColor: UIColor {
        return appColorDarkWhite
    }
    
}

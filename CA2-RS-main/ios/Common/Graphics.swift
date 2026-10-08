import UIKit
import SwiftMessages
import FCAlertView

@MainActor
class Graphics: NSObject {
    
    // --------------------------------------
    // MARK: Views
    // --------------------------------------
    
    class func dropShadow(_ view: UIView, opacity: CGFloat, radius: CGFloat, offset: CGSize) {
        dropShadow(view, color: ColorBrand.appColorDarkGray, opacity: opacity, radius: radius, offset: offset)
    }
    
    class func dropShadow(_ view: UIView, color: UIColor?, opacity: CGFloat, radius: CGFloat, offset: CGSize) {
        view.layer.masksToBounds = false
        view.layer.rasterizationScale = UIScreen.main.scale
        view.layer.shouldRasterize = true
        view.layer.shadowColor = color?.cgColor
        view.layer.shadowOffset = offset
        view.layer.shadowRadius = radius
        view.layer.shadowOpacity = Float(opacity)
    }
    
    class func showMessage(_ theme: Theme, body: String, hideButton: Bool = true) {
        var config = SwiftMessages.Config()
        config.duration = .seconds(seconds: 5)
        config.presentationStyle = .top
        SwiftMessages.show(config: config) {
            let view = MessageView.viewFromNib(layout: .cardView)
            var backgroundColor: UIColor = ColorBrand.appColorGreen
            let foregroundColor: UIColor = ColorBrand.appColorWhite
            var title = ""
            switch theme {
                case .info:
                    backgroundColor = ColorBrand.appColorBlueSky
                title = NSLocalizedString("message_info", comment: "")
                case .success:
                    backgroundColor = ColorBrand.appColorGreen
                    title = NSLocalizedString("message_success", comment: "")
                case .warning:
                    backgroundColor = ColorBrand.appColorOrange
                    title = NSLocalizedString("message_warning", comment: "")
                case .error:
                    backgroundColor = ColorBrand.appColorRed
                    title = NSLocalizedString("message_error", comment: "")
                @unknown default:
                    backgroundColor = ColorBrand.appColorRed
                    title = NSLocalizedString("message_error", comment: "")
            }
            let iconImage = IconStyle.default.image(theme: theme)
            view.configureTheme(backgroundColor: backgroundColor, foregroundColor: foregroundColor, iconImage: iconImage)
            view.configureContent(title: title, body: body)
            view.button?.setTitle(LOCALIZED("dismiss"), for: .normal)
            view.buttonTapHandler = { _ in SwiftMessages.hide() }
            view.titleLabel?.font = FontBrand.alertTitleFont
            view.bodyLabel?.font = FontBrand.alertMessageFont
            view.button?.titleLabel?.font = FontBrand.buttonTitleFont
            view.button?.isHidden = hideButton
            return view
        }
    }
    
    class func showMessage(_ theme: Theme, title: String, body: String) {
        var config = SwiftMessages.Config()
        config.duration = .seconds(seconds: 5)
        config.presentationStyle = .top
        SwiftMessages.show(config: config) {
            let view = MessageView.viewFromNib(layout: .cardView)
            var backgroundColor: UIColor = ColorBrand.appColorGreen
            let foregroundColor: UIColor = ColorBrand.appColorWhite
            switch theme {
                case .info:
                    backgroundColor = ColorBrand.appColorBlueSky
                case .success:
                    backgroundColor = ColorBrand.appColorGreen
                case .warning:
                    backgroundColor = ColorBrand.appColorOrange
                case .error:
                    backgroundColor = ColorBrand.appColorRed
                @unknown default:
                    backgroundColor = ColorBrand.appColorDarkGray
            }
            let iconImage = IconStyle.default.image(theme: theme)
            view.configureTheme(backgroundColor: backgroundColor, foregroundColor: foregroundColor, iconImage: iconImage)
            view.configureContent(title: title, body: body)
            view.button?.setTitle(LOCALIZED("dismiss"), for: .normal)
            view.buttonTapHandler = { _ in SwiftMessages.hide() }
            view.titleLabel?.font = FontBrand.alertTitleFont
            view.bodyLabel?.font = FontBrand.alertMessageFont
            view.button?.titleLabel?.font = FontBrand.buttonTitleFont
            return view
        }
    }
    
    class func showAlert(
        title: String = "",
        message: String = "",
        image: UIImage? = nil,
        hideCancelButton: Bool = true,
        cancelTitle: String = LOCALIZED("cancel"),
        otherTitle: String, handler: @escaping() -> Void) {
        
        let alert = FCAlertView()
        alert.cornerRadius = kCornerRadius
        alert.bounceAnimations = false
        alert.hideDoneButton = true
        alert.detachButtons = false
        alert.tintColor = ColorBrand.appColorNavy
        alert.hideSeparatorLineView = true
            alert.alertBackgroundColor = ColorBrand.appColorDarkGray
        alert.titleFont = FontBrand.alertTitleFont
        alert.subtitleFont = FontBrand.alertMessageFont
        alert.firstButtonCustomFont = FontBrand.buttonTitleFont
        alert.secondButtonCustomFont = FontBrand.buttonTitleFont
        alert.titleColor = ColorBrand.appColorBackground
        alert.subTitleColor = ColorBrand.appColorBackground
        alert.firstButtonTitleColor = ColorBrand.appColorBackground
        alert.firstButtonBackgroundColor = ColorBrand.appColorDarkGray
        alert.secondButtonTitleColor = ColorBrand.appColorBackground
        alert.secondButtonBackgroundColor = ColorBrand.appColorDarkGray
        if !hideCancelButton { alert.addButton(cancelTitle) { } }
        alert.addButton(otherTitle) { handler() }
        alert.showAlert(withTitle: title, withSubtitle: message, withCustomImage: image, withDoneButtonTitle: nil, andButtons: nil)
    }
    
    class func showAlert(
        title: String = "",
        message: String = "",
        image: UIImage? = nil,
        cancelTitle: String, handler: @escaping() -> Void) {
        
        let alert = FCAlertView()
        alert.cornerRadius = kCornerRadius
        alert.bounceAnimations = false
        alert.hideDoneButton = true
        alert.detachButtons = false
        alert.tintColor = ColorBrand.appColorNavy
        alert.hideSeparatorLineView = true
        alert.alertBackgroundColor = ColorBrand.appColorBackground
        alert.titleFont = FontBrand.alertTitleFont
        alert.subtitleFont = FontBrand.alertMessageFont
        alert.firstButtonCustomFont = FontBrand.buttonTitleFont
        alert.secondButtonCustomFont = FontBrand.buttonTitleFont
        alert.titleColor = ColorBrand.appColorNavy
        alert.subTitleColor = ColorBrand.appColorDarkGray
        alert.firstButtonTitleColor = ColorBrand.appColorNavy
        alert.firstButtonBackgroundColor = ColorBrand.appColorBackground
        alert.secondButtonTitleColor = ColorBrand.appColorBackground
        alert.secondButtonBackgroundColor = ColorBrand.appColorGreen
        alert.addButton(cancelTitle) { handler() }
        alert.showAlert(withTitle: title, withSubtitle: message, withCustomImage: image, withDoneButtonTitle: nil, andButtons: nil)
    }
    
    class func hideAllMessages() {
        SwiftMessages.hideAll()
    }
}

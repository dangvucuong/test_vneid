import UIKit

public let APP = Application.shared

public class Application: NSObject {

    public var window: UIWindow?
    public var orientation: UIInterfaceOrientation = .portrait
    public let lightFeedback = UIImpactFeedbackGenerator(style: .light)
    public let mediumFeedback = UIImpactFeedbackGenerator(style: .medium)
    public let heavyFeedback = UIImpactFeedbackGenerator(style: .heavy)

    private let releaseDateString: String = "08/31/2023"

    // --------------------------------------
    // MARK: Singleton
    // --------------------------------------

    class var shared: Application {
        struct Static {
            static let instance = Application()
        }
        return Static.instance
    }

    override init() {
        super.init()
        mediumFeedback.prepare()
        heavyFeedback.prepare()
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------
    
    var isPad: Bool {
        UIDevice.current.userInterfaceIdiom == .pad
    }

    public var bundleId: String {
        return Bundle.main.bundleIdentifier ?? ""
    }

    public var displayName: String {
        Bundle.main.infoDictionary?["CFBundleDisplayName"] as? String ?? "XVerify Demo"
    }

    public var version: String {
        return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
    }

    public var buildVersion: String {
        return Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
    }

    public var buildMode: String {
        #if DEBUG
            return "DEBUG"
        #else
            return "RELEASE"
        #endif
    }

    public var shortVersionText: String {
        let version = "Version \(self.version)"
        let buildVersion = "Build \(self.buildVersion)"
        if buildMode != "RELEASE" {
            return String(format: "%@ %@ - %@", version, buildVersion, "")
        } else {
            return String(format: "%@", version)
        }
    }

    public var versionText: String {
        let version = "Version \(self.version)"
        let buildVersion = "Build \(self.buildVersion)"
        if buildMode != "RELEASE" {
            return String(format: "%@ %@ - %@ (%@)", version, buildVersion, buildMode, releaseDateString)
        } else {
            return String(format: "%@ - %@", version, buildVersion)
        }
    }

    public var isAppStoreEnvironment: Bool {
        #if TARGET_OS_IPHONE && !TARGET_IPHONE_SIMULATOR
            return Bundle.main.path(forResource: "embedded", ofType: "mobileprovision") == nil
        #else
            return false
        #endif
    }

    public var systemApplication: UIApplication {
        return UIApplication.shared
    }

    public var iconBadgeNumber: Int {
        return systemApplication.applicationIconBadgeNumber
    }

    public var debugInfo: String {
        return "Application: <BundleId: \(bundleId),  Version: \(version),  Build Mode: \(buildMode.uppercased())," +
            "  Env: \("") AppStoreEnv: \(isAppStoreEnvironment),  Badges: \(iconBadgeNumber)>"
    }

    public var deviceUuid: String {
        return UIDevice.current.identifierForVendor?.uuidString ?? ""
    }

    public var deviceType: String { "mobile" }

    public var baseUrl: URL {
        let url = URL(fileURLWithPath: NSHomeDirectory(), isDirectory: true)
        return url
    }

    public var appState: UIApplication.State {
        return systemApplication.applicationState
    }

    public func setIconBadgeNumber(_ iconBadgeNumber: Int) {
        systemApplication.applicationIconBadgeNumber = iconBadgeNumber
    }

    public func statusBarHeight(isNavigationBar: Bool = true) -> CGFloat {
        let height = window?.windowScene?.statusBarManager?.statusBarFrame.height ?? 0
        return isNavigationBar ? height + kNavigationBarDefaultHeight : height
    }
}

import UIKit

public protocol NibLoadable {
	static var nibName: String { get }
}

extension NibLoadable where Self: UIView {

	public static var bundle: Bundle {
		return Bundle(for: Self.self)
	}

    public static var nibName: String {
		return String(describing: Self.self)
	}

	static public var nib: UINib {
		return UINib(nibName: Self.nibName, bundle: bundle)
	}

	func setupFromNib() {
		guard let view = Self.nib.instantiate(withOwner: self, options: nil).first as? UIView else { fatalError("Error loading \(self) from nib") }
		addSubview(view)
		view.translatesAutoresizingMaskIntoConstraints = false

		if #available(iOS 11.0, *) {
			view.leadingAnchor.constraint(equalTo: safeAreaLayoutGuide.leadingAnchor, constant: 0).isActive = true
			view.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 0).isActive = true
			view.trailingAnchor.constraint(equalTo: safeAreaLayoutGuide.trailingAnchor, constant: 0).isActive = true
			view.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor, constant: 0).isActive = true
		} else {
			view.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 0).isActive = true
			view.topAnchor.constraint(equalTo: topAnchor, constant: 0).isActive = true
			view.trailingAnchor.constraint(equalTo: trailingAnchor, constant: 0).isActive = true
			view.bottomAnchor.constraint(equalTo: bottomAnchor, constant: 0).isActive = true
		}
	}
}

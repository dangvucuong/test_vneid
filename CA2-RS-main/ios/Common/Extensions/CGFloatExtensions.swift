
import UIKit

extension CGFloat {
	init(state string: String, divisor: Float) {
		let numberFormatter = NumberFormatter()
		numberFormatter.locale = Locale(identifier: "EN")
		if let number = numberFormatter.number(from: string) {
			self.init(number.floatValue / divisor)
		} else {
			self.init(0)
		}
	}
}

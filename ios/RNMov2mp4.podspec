
Pod::Spec.new do |s|
  s.name         = "RNMov2mp4"
  s.version      = "1.0.0"
  s.summary      = "RNMov2mp4"
  s.description  = <<-DESC
                  RNMov2mp4
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNMov2mp4.git", :tag => "master" }
  s.source_files  = "RNMov2mp4/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  
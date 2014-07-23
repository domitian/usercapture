class VideoCaptureController < ApplicationController

	def index
		unless params[:img].blank?
			# puts "#{params[:img].inspect}"
    		  filename = 'img/' + Time.now.to_s + '.png'
			  data = params[:img]
			  data_index = data.index('base64') + 7
			  filedata = data.slice(data_index, data.length)
			  File.open(filename, "wb"){ |file| file.write(Base64.decode64(filedata)) }
		end
		# render js: []

	end

end

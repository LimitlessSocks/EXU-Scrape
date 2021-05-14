def get_body_segment(lines)
    h = lines.shift
    
end

lines = File.read(ARGV[0]).lines
until lines.empty?
    t = lines.shift
    if /\[\d+\] note:.*?card id (\d+) \((.+?)\).*?changed/ === t
        id, name = $1, $2
        
    end
end
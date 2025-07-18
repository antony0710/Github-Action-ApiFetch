#getting the file name under weather_data/ and store it to index.json
import os
def generate_index():
    directory = 'weather_data'
    index_file = './weather_data/index.json'
    
    # List all files in the directory
    files = os.listdir(directory)
    
    # Filter out only .json files
    json_files = [f for f in files if f.endswith('.json')]
    
    # Create the index dictionary
    index = {'files': json_files}
    
    # Write the index to a JSON file
    with open(index_file, 'w') as f:
        import json
        json.dump(index, f, indent=4)

if __name__ == "__main__":
    generate_index()
    print("Index generated successfully in index.json")
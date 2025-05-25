import json
from pathlib import Path

CONFIG_PATH = 'config.json'


class SystemConfig:
    """
    Singleton class to manage system configuration.
    This class loads configuration from a JSON file and provides access to its data.
    """

    def __init__(self):
        _data = None
        self.load_config()
        pass

    def load_config(self):
        config_file_path = Path(__file__).parent.parent.parent / CONFIG_PATH
        with open(config_file_path, 'r') as config_file:
            self._data = json.load(config_file)
        pass

    def get(self, key, default=None):
        return self._data[key]


CONFIG = SystemConfig()

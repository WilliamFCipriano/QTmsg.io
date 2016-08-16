import os
import sys
from inspect import getframeinfo, stack



reserved_word_list = ['y','Y','TRUE','True','true','t','n','N','FALSE','False','false','f']
# reserved words can be mapped to states, values or objects.

skip_list = ["//","    ","   ","#","<!--","/*",".","!"]


def reserved_word(statement):
    # the functionality of reserved words should be declared here.
    if statement in {'y','Y','TRUE','True','true','t'}:
        return True
    elif statement in {'n','N','FALSE','False','false','f'}:
        return False
    return statement


def parse_config(location, app_root_relative=True):
    if app_root_relative:
        root = os.path.dirname(os.path.abspath(__file__)) + "/"
    else:
        root = os.path.abspath(os.sep)
    config_data = open(root + location)
    config_data = config_data.read()
    config = dict()
    config_data = config_data.split('\n')
    for configuration in config_data:
        if configuration != '' and '=' in configuration:
            if configuration[:2] not in skip_list:
                configuration = configuration.split(' = ')
                if configuration[1] not in reserved_word_list and configuration[1].isdigit() == False:
                    config[configuration[0]] = configuration[1]
                else:
                    if configuration[1].isdigit():
                        config[configuration[0]] = int(configuration[1])
                    else:
                        config[configuration[0]] = reserved_word(configuration[1])
    return config


class configurationData:

    def __init__(self,filename,is_global_config=False):

        try:
            if is_global_config is True:
                raw_config = parse_config('config_location')
            else:
                if filename is None:
                    filename = 'config.txt'
                if global_config.application_relative_path:
                    raw_config = parse_config(global_config.config_location + filename)
                else:
                    raw_config = parse_config(global_config.config_location + filename,app_root_relative=False)
            self.__dict__.update(raw_config)
        # if a dictionary is not returned, this should fail.
        except TypeError:
            # Correct configuration files are a requirement
            print 'FATAL ERROR: Configuration loading has failed.'
            try:
                if global_config.hard_fail_on_error:
                    print 'FATAL ERROR: Problems have been detected with the configuration file, ending program.'
                    sys.exit(1)
                else:
                    print 'FATAL ERROR: Problems have been detected with the configuration file.'
            except NameError:
                print 'FATAL ERROR: Problems have been detected with the configuration file.'

    def lookup(self,setting):
        return getattr(self,setting)

    def debug(self, msg, l=5):
        caller = getframeinfo(stack()[1][0])
        item = {'file':caller.filename,'line':caller.lineno,'msg':msg,'level':l}
        self.log(item)
        if int(item['level']) <= global_config.debug_output_verbosity:
            print item['file'] + ': "' + str(item['msg']) + '" on line:' + str(item['line'])
        return item

    def log(self,item):
        pass



    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name + ' at address ' + hex(id(self))


global_config = configurationData(None,is_global_config=True)